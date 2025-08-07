import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Permission } from '../../permission/entities/permission.entity';

@Index(['status', 'createdAt'])
@Entity('roles')
export class Role {
  @ApiProperty({ description: '角色ID', example: 1 })
  @PrimaryGeneratedColumn({ comment: '角色ID' })
  id: number;

  @ApiProperty({ description: '角色名称', example: '管理员', maxLength: 50 })
  @Column({ unique: true, length: 50, comment: '角色名称' })
  name: string;

  @ApiProperty({ description: '角色代码', example: 'admin', maxLength: 50 })
  @Column({ unique: true, length: 50, comment: '角色代码' })
  code: string;

  @ApiProperty({ description: '角色描述', example: '系统管理员，拥有所有权限', maxLength: 500, required: false })
  @Column({ length: 500, nullable: true, comment: '角色描述' })
  description: string;

  @ApiProperty({ description: '角色状态', enum: ['active', 'inactive'], example: 'active', default: 'active' })
  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active', comment: '角色状态' })
  status: string;

  @ApiProperty({ description: '角色级别', example: 1, minimum: 0, default: 0 })
  @Column({ default: 0, comment: '角色级别，数字越大权限越高' })
  level: number;

  @ApiProperty({ description: '角色权限', type: () => [Permission], required: false })
  @ManyToMany(() => Permission, (permission) => permission.roles, { cascade: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @ApiProperty({ description: '是否为系统内置角色', example: false, default: false })
  @Column({ default: false, comment: '是否为系统内置角色，内置角色不可删除' })
  isSystem: boolean;

  @ApiProperty({ description: '排序权重', example: 100, default: 0 })
  @Column({ default: 0, comment: '排序权重，数字越大排序越靠前' })
  sort: number;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T12:00:00Z' })
  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T12:00:00Z' })
  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '删除时间（软删除）', example: '2024-01-01T12:00:00Z', required: false })
  @DeleteDateColumn({ select: false, type: 'timestamp', comment: '删除时间(软删除)' })
  deletedAt: Date;

  @ApiProperty({ description: '拥有此角色的用户', type: () => [User], required: false })
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  /**
   * 检查角色是否活跃
   * @returns {boolean} 是否活跃
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * 检查是否拥有指定权限
   * @param {string} permissionCode 权限代码
   * @returns {boolean} 是否拥有权限
   */
  hasPermission(permissionCode: string): boolean {
    if (!this.permissions || this.permissions.length === 0) {
      return false;
    }
    return this.permissions.some((permission) => permission.code === permissionCode && permission.isActive());
  }

  /**
   * 检查是否拥有指定模块的权限
   * @param {string} module 模块名
   * @param {string} action 操作类型
   * @returns {boolean} 是否拥有权限
   */
  hasModulePermission(module: string, action: string): boolean {
    if (!this.permissions || this.permissions.length === 0) {
      return false;
    }
    return this.permissions.some((permission) => permission.module === module && permission.action === action && permission.isActive());
  }

  /**
   * 获取角色所有权限代码
   * @returns {string[]} 权限代码列表
   */
  getPermissionCodes(): string[] {
    if (!this.permissions || this.permissions.length === 0) {
      return [];
    }
    return this.permissions.filter((permission) => permission.isActive()).map((permission) => permission.code);
  }

  /**
   * 获取指定模块的权限
   * @param {string} module 模块名
   * @returns {Permission[]} 权限列表
   */
  getModulePermissions(module: string): Permission[] {
    if (!this.permissions || this.permissions.length === 0) {
      return [];
    }
    return this.permissions.filter((permission) => permission.module === module && permission.isActive());
  }

  /**
   * 检查是否为系统管理员角色
   * @returns {boolean} 是否为管理员
   */
  isAdmin(): boolean {
    return this.code === 'admin' || this.code === 'super_admin';
  }

  /**
   * 检查角色是否可以被删除
   * @returns {boolean} 是否可删除
   */
  canDelete(): boolean {
    return !this.isSystem;
  }
}
