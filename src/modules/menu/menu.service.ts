import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, In } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { Permission } from '../permission/entities/permission.entity';
import { CreateMenuDto, UpdateMenuDto, QueryMenuDto } from './dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * 创建菜单
   */
  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const { permissionIds, ...menuData } = createMenuDto;

    // 检查路径是否已存在
    const existingMenu = await this.menuRepository.findOne({
      where: { path: menuData.path },
    });

    if (existingMenu) {
      throw new ConflictException('菜单路径已存在');
    }

    // 验证父菜单是否存在
    if (menuData.parentId) {
      const parentMenu = await this.menuRepository.findOne({
        where: { id: menuData.parentId },
      });

      if (!parentMenu) {
        throw new BadRequestException('父菜单不存在');
      }

      // 验证父菜单类型（按钮不能有子菜单）
      if (parentMenu.isButton()) {
        throw new BadRequestException('按钮类型的菜单不能有子菜单');
      }
    }

    // 创建菜单
    const menu = this.menuRepository.create(menuData);

    // 关联权限
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findBy({
        id: In(permissionIds),
      });
      menu.permissions = permissions;
    }

    const savedMenu = await this.menuRepository.save(menu);

    // 更新菜单路径
    await this.updateMenuPath(savedMenu);

    return this.findOne(savedMenu.id);
  }

  /**
   * 查询菜单列表
   */
  async findAll(queryDto: QueryMenuDto): Promise<{ data: Menu[]; total: number }> {
    const { page = 1, limit = 10, name, title, path, type, status, hidden, parentId, isSystem } = queryDto;

    const where: FindManyOptions<Menu>['where'] = {};

    if (name) where.name = Like(`%${name}%`);
    if (title) where.title = Like(`%${title}%`);
    if (path) where.path = Like(`%${path}%`);
    if (type) where.type = type;
    if (status) where.status = status;
    if (hidden !== undefined) where.hidden = hidden;
    if (parentId !== undefined) where.parentId = parentId;
    if (isSystem !== undefined) where.isSystem = isSystem;

    const options: FindManyOptions<Menu> = {
      where,
      relations: ['permissions'],
      order: { sort: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [data, total] = await this.menuRepository.findAndCount(options);
    return { data, total };
  }

  /**
   * 根据ID查询菜单
   */
  async findOne(id: number): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    return menu;
  }

  /**
   * 更新菜单
   */
  async update(id: number, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);
    const { permissionIds, ...menuData } = updateMenuDto;

    // 检查路径是否已存在（排除当前菜单）
    if (menuData.path && menuData.path !== menu.path) {
      const existingMenu = await this.menuRepository.findOne({
        where: { path: menuData.path },
      });

      if (existingMenu && existingMenu.id !== id) {
        throw new ConflictException('菜单路径已存在');
      }
    }

    // 验证父菜单是否存在
    if (menuData.parentId && menuData.parentId !== menu.parentId) {
      // 检查是否会形成循环引用
      if (await this.wouldCreateCircularReference(id, menuData.parentId)) {
        throw new BadRequestException('不能将菜单设置为自己或子菜单的父菜单');
      }

      const parentMenu = await this.menuRepository.findOne({
        where: { id: menuData.parentId },
      });

      if (!parentMenu) {
        throw new BadRequestException('父菜单不存在');
      }

      // 验证父菜单类型
      if (parentMenu.isButton()) {
        throw new BadRequestException('按钮类型的菜单不能有子菜单');
      }
    }

    // 更新菜单数据
    Object.assign(menu, menuData);

    // 更新关联权限
    if (permissionIds !== undefined) {
      if (permissionIds.length > 0) {
        const permissions = await this.permissionRepository.findBy({
          id: In(permissionIds),
        });
        menu.permissions = permissions;
      } else {
        menu.permissions = [];
      }
    }

    const savedMenu = await this.menuRepository.save(menu);

    // 如果父菜单发生变化，更新菜单路径
    if (menuData.parentId !== undefined) {
      await this.updateMenuPath(savedMenu);
      await this.updateChildrenPaths(savedMenu.id);
    }

    return this.findOne(savedMenu.id);
  }

  /**
   * 删除菜单
   */
  async remove(id: number): Promise<void> {
    const menu = await this.findOne(id);

    if (menu.isSystem) {
      throw new BadRequestException('系统菜单不能删除');
    }

    const childMenus = await this.menuRepository.find({
      where: { parentId: id },
    });

    if (childMenus.length > 0) {
      throw new BadRequestException('存在子菜单，不能删除');
    }

    await this.menuRepository.softRemove(menu);
  }

  /**
   * 获取菜单树
   */
  async getMenuTree(): Promise<Menu[]> {
    const menus = await this.menuRepository.find({
      where: { status: 'active' },
      relations: ['permissions'],
      order: { sort: 'DESC', createdAt: 'ASC' },
    });

    return this.buildTree(menus);
  }

  /**
   * 根据用户权限获取菜单树
   */
  async getUserMenuTree(userPermissions: string[]): Promise<Menu[]> {
    const menus = await this.menuRepository.find({
      where: { status: 'active', hidden: false },
      relations: ['permissions'],
      order: { sort: 'DESC', createdAt: 'ASC' },
    });

    // 过滤用户有权限的菜单
    const accessibleMenus = menus.filter((menu) => {
      // 如果菜单没有关联权限，则所有用户都可以访问
      if (!menu.permissions || menu.permissions.length === 0) {
        return true;
      }

      // 检查用户是否有菜单关联的任一权限
      return menu.permissions.some((permission) => userPermissions.includes(permission.code));
    });

    return this.buildTree(accessibleMenus);
  }

  /**
   * 构建菜单树
   */
  private buildTree(menus: Menu[], parentId: number | null = null): Menu[] {
    const tree: Menu[] = [];

    for (const menu of menus) {
      if (menu.parentId === parentId) {
        const children = this.buildTree(menus, menu.id);
        if (children.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (menu as any).children = children;
        }
        tree.push(menu);
      }
    }

    return tree;
  }

  /**
   * 更新菜单路径
   */
  private async updateMenuPath(menu: Menu): Promise<void> {
    let path = menu.id.toString();

    if (menu.parentId) {
      const parentMenu = await this.menuRepository.findOne({
        where: { id: menu.parentId },
      });

      if (parentMenu && parentMenu.menuPath) {
        path = `${parentMenu.menuPath},${menu.id}`;
      }
    }

    await this.menuRepository.update(menu.id, { menuPath: path });
  }

  /**
   * 更新子菜单路径
   */
  private async updateChildrenPaths(parentId: number): Promise<void> {
    const childMenus = await this.menuRepository.find({
      where: { parentId },
    });

    for (const child of childMenus) {
      await this.updateMenuPath(child);
      await this.updateChildrenPaths(child.id);
    }
  }

  /**
   * 检查是否会形成循环引用
   */
  private async wouldCreateCircularReference(menuId: number, parentId: number): Promise<boolean> {
    if (menuId === parentId) {
      return true;
    }

    const parentMenu = await this.menuRepository.findOne({
      where: { id: parentId },
    });

    if (!parentMenu || !parentMenu.menuPath) {
      return false;
    }

    const parentPath = parentMenu.menuPath.split(',').map(Number);
    return parentPath.includes(menuId);
  }
}
