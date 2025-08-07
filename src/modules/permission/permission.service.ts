import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from '../role/entities/role.entity';
import { CreatePermissionDto, UpdatePermissionDto, QueryPermissionDto } from './dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * 创建权限
   */
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findOne({
      where: { code: createPermissionDto.code },
    });
    if (existingPermission) {
      throw new ConflictException(`权限代码 ${createPermissionDto.code} 已存在`);
    }

    if (createPermissionDto.parentId) {
      const parentPermission = await this.permissionRepository.findOne({
        where: { id: createPermissionDto.parentId },
      });
      if (!parentPermission) {
        throw new NotFoundException(`父权限 ID ${createPermissionDto.parentId} 不存在`);
      }
    }

    if (!createPermissionDto.code) {
      createPermissionDto.code = Permission.generateCode(createPermissionDto.module, createPermissionDto.action);
    }

    const permission = this.permissionRepository.create(createPermissionDto);

    if (createPermissionDto.parentId) {
      const parentPermission = await this.permissionRepository.findOne({
        where: { id: createPermissionDto.parentId },
      });
      permission.path = parentPermission?.path ? `${parentPermission.path},${permission.id}` : `${createPermissionDto.parentId}`;
    }

    return await this.permissionRepository.save(permission);
  }

  /**
   * 查询权限列表
   */
  async findAll(queryDto: QueryPermissionDto): Promise<{ data: Permission[]; total: number }> {
    const { page = 1, limit = 10, name, code, module, action, status, parentId, isSystem } = queryDto;

    const where: FindManyOptions<Permission>['where'] = {};

    if (name) where.name = Like(`%${name}%`);
    if (code) where.code = Like(`%${code}%`);
    if (module) where.module = module;
    if (action) where.action = action;
    if (status) where.status = status;
    if (parentId !== undefined) where.parentId = parentId;
    if (isSystem !== undefined) where.isSystem = isSystem;

    const options: FindManyOptions<Permission> = {
      where,
      relations: ['roles'],
      order: { sort: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [data, total] = await this.permissionRepository.findAndCount(options);
    return { data, total };
  }

  /**
   * 根据ID查询权限
   */
  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!permission) {
      throw new NotFoundException(`权限 ID ${id} 不存在`);
    }

    return permission;
  }

  /**
   * 更新权限
   */
  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    if (permission.isSystem && updatePermissionDto.isSystem === false) {
      throw new BadRequestException('不能修改系统权限的系统标识');
    }

    if (updatePermissionDto.code && updatePermissionDto.code !== permission.code) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { code: updatePermissionDto.code },
      });
      if (existingPermission) {
        throw new ConflictException(`权限代码 ${updatePermissionDto.code} 已存在`);
      }
    }

    Object.assign(permission, updatePermissionDto);
    return await this.permissionRepository.save(permission);
  }

  /**
   * 删除权限
   */
  async remove(id: number): Promise<void> {
    const permission = await this.findOne(id);

    if (permission.isSystem) {
      throw new BadRequestException('系统权限不能删除');
    }

    const childPermissions = await this.permissionRepository.find({
      where: { parentId: id },
    });

    if (childPermissions.length > 0) {
      throw new BadRequestException('存在子权限，不能删除');
    }

    await this.permissionRepository.softRemove(permission);
  }

  /**
   * 获取权限树
   */
  async getPermissionTree(): Promise<Permission[]> {
    const permissions = await this.permissionRepository.find({
      where: { status: 'active' },
      order: { sort: 'ASC', createdAt: 'ASC' },
    });

    return this.buildTree(permissions);
  }

  async findByCode(code: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { code },
    });

    if (!permission) {
      throw new NotFoundException('权限不存在');
    }

    return permission;
  }

  private buildTree(permissions: Permission[], parentId: number | null = null): Permission[] {
    const tree: Permission[] = [];

    for (const permission of permissions) {
      if (permission.parentId === parentId) {
        const children = this.buildTree(permissions, permission.id);
        if (children.length > 0) {
          (permission as Permission & { children: Permission[] }).children = children;
        }
        tree.push(permission);
      }
    }

    return tree;
  }
}
