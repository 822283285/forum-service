import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, In, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { User } from '../user/entities/user.entity';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto, RolePermissionDto } from './dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 创建角色
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: [{ code: createRoleDto.code }, { name: createRoleDto.name }],
    });

    if (existingRole) {
      if (existingRole.code === createRoleDto.code) {
        throw new ConflictException(`角色代码 ${createRoleDto.code} 已存在`);
      }
      if (existingRole.name === createRoleDto.name) {
        throw new ConflictException(`角色名称 ${createRoleDto.name} 已存在`);
      }
    }

    const role = this.roleRepository.create(createRoleDto);

    // 如果指定了权限ID，关联权限
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: { id: In(createRoleDto.permissionIds) },
      });

      if (permissions.length !== createRoleDto.permissionIds.length) {
        throw new NotFoundException('部分权限不存在');
      }

      role.permissions = permissions;
    }

    return await this.roleRepository.save(role);
  }

  /**
   * 查询角色列表
   */
  async findAll(queryDto: QueryRoleDto): Promise<{ data: Role[]; total: number }> {
    const { page = 1, limit = 10, name, code, status, isSystem, minLevel, maxLevel } = queryDto;

    const where: FindManyOptions<Role>['where'] = {};

    if (name) where.name = Like(`%${name}%`);
    if (code) where.code = Like(`%${code}%`);
    if (status) where.status = status;
    if (isSystem !== undefined) where.isSystem = isSystem;
    if (minLevel !== undefined && maxLevel !== undefined) {
      where.level = MoreThanOrEqual(minLevel) && LessThanOrEqual(maxLevel);
    } else if (minLevel !== undefined) {
      where.level = MoreThanOrEqual(minLevel);
    } else if (maxLevel !== undefined) {
      where.level = LessThanOrEqual(maxLevel);
    }

    const options: FindManyOptions<Role> = {
      where,
      relations: ['permissions', 'users'],
      order: { sort: 'DESC', level: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [data, total] = await this.roleRepository.findAndCount(options);
    return { data, total };
  }

  /**
   * 根据ID查询角色
   */
  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'users'],
    });

    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    return role;
  }

  /**
   * 根据代码查询角色
   */
  async findByCode(code: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { code },
      relations: ['permissions', 'users'],
    });

    if (!role) {
      throw new NotFoundException(`角色代码 ${code} 不存在`);
    }

    return role;
  }

  /**
   * 更新角色
   */
  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (role.isSystem && updateRoleDto.isSystem === false) {
      throw new BadRequestException('不能修改系统角色的系统标识');
    }

    // 检查名称和代码是否重复
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });
      if (existingRole) {
        throw new ConflictException(`角色名称 ${updateRoleDto.name} 已存在`);
      }
    }

    if (updateRoleDto.code && updateRoleDto.code !== role.code) {
      const existingRole = await this.roleRepository.findOne({
        where: { code: updateRoleDto.code },
      });
      if (existingRole) {
        throw new ConflictException(`角色代码 ${updateRoleDto.code} 已存在`);
      }
    }

    // 更新权限关联
    if (updateRoleDto.permissionIds !== undefined) {
      if (updateRoleDto.permissionIds.length > 0) {
        const permissions = await this.permissionRepository.find({
          where: { id: In(updateRoleDto.permissionIds) },
        });

        if (permissions.length !== updateRoleDto.permissionIds.length) {
          throw new NotFoundException('部分权限不存在');
        }

        role.permissions = permissions;
      } else {
        role.permissions = [];
      }
    }

    Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(role);
  }

  /**
   * 删除角色
   */
  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new BadRequestException('系统角色不能删除');
    }

    // 检查是否有用户使用此角色
    if (role.users && role.users.length > 0) {
      throw new BadRequestException('该角色下还有用户，不能删除');
    }

    await this.roleRepository.softRemove(role);
  }

  /**
   * 为用户分配角色
   */
  async assignToUser(userId: number, roleIds: number[]): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${userId} 不存在`);
    }

    const roles = await this.roleRepository.find({
      where: { id: In(roleIds) },
    });

    if (roles.length !== roleIds.length) {
      throw new NotFoundException('部分角色不存在');
    }

    // 合并现有角色和新角色
    const existingRoleIds = user.roles.map((r) => r.id);
    const newRoles = roles.filter((r) => !existingRoleIds.includes(r.id));

    user.roles = [...user.roles, ...newRoles];
    await this.userRepository.save(user);
  }

  /**
   * 为多个用户分配角色
   */
  async assignRoleToUsers(roleId: number, userIds: number[]): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const users = await this.userRepository.find({
      where: { id: In(userIds) },
      relations: ['roles'],
    });
    if (users.length !== userIds.length) {
      throw new NotFoundException('部分用户不存在');
    }

    for (const user of users) {
      const hasRole = user.roles.some((r) => r.id === roleId);
      if (!hasRole) {
        user.roles.push(role);
        await this.userRepository.save(user);
      }
    }
  }

  /**
   * 从用户撤销角色
   */
  async revokeFromUser(userId: number, roleIds: number[]): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${userId} 不存在`);
    }

    user.roles = user.roles.filter((r) => !roleIds.includes(r.id));
    await this.userRepository.save(user);
  }

  /**
   * 从多个用户撤销角色
   */
  async revokeRoleFromUsers(roleId: number, userIds: number[]): Promise<void> {
    const users = await this.userRepository.find({
      where: { id: In(userIds) },
      relations: ['roles'],
    });
    if (users.length !== userIds.length) {
      throw new NotFoundException('部分用户不存在');
    }

    for (const user of users) {
      user.roles = user.roles.filter((role) => role.id !== roleId);
      await this.userRepository.save(user);
    }
  }

  /**
   * 设置角色权限
   */
  async setPermissions(rolePermissionDto: RolePermissionDto): Promise<void> {
    const { roleId, permissionIds } = rolePermissionDto;

    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`角色 ID ${roleId} 不存在`);
    }

    if (permissionIds.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: { id: In(permissionIds) },
      });

      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException('部分权限不存在');
      }

      role.permissions = permissions;
    } else {
      role.permissions = [];
    }

    await this.roleRepository.save(role);
  }

  /**
   * 设置角色权限（简化版本）
   */
  async setRolePermissions(roleId: number, permissionIds: number[]): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });
    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('部分权限不存在');
    }

    role.permissions = permissions;
    await this.roleRepository.save(role);
  }

  /**
   * 获取角色的权限列表
   */
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`角色 ID ${roleId} 不存在`);
    }

    return role.permissions || [];
  }

  /**
   * 获取角色的用户列表
   */
  async getRoleUsers(roleId: number): Promise<User[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['users'],
    });

    if (!role) {
      throw new NotFoundException(`角色 ID ${roleId} 不存在`);
    }

    return role.users || [];
  }

  /**
   * 获取所有活跃角色
   */
  async getActiveRoles(): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { status: 'active' },
      order: { level: 'DESC', sort: 'DESC' },
    });
  }
}
