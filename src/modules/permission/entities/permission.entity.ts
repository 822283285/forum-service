import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../role/entities/role.entity';

@Index(['status', 'createdAt'])
@Index(['module', 'action'])
@Entity('permissions')
export class Permission {
  @ApiProperty({ description: '权限ID', example: 1 })
  @PrimaryGeneratedColumn({ comment: '权限ID' })
  id: number;

  @ApiProperty({ description: '权限名称', example: '用户管理', maxLength: 50 })
  @Column({ length: 50, comment: '权限名称' })
  name: string;

  @ApiProperty({ description: '权限代码', example: 'user:read', maxLength: 100 })
  @Column({ unique: true, length: 100, comment: '权限代码，格式：模块:操作' })
  code: string;

  @ApiProperty({ description: '权限描述', example: '查看用户信息的权限', maxLength: 500, required: false })
  @Column({ length: 500, nullable: true, comment: '权限描述' })
  description: string;

  @ApiProperty({ description: '所属模块', example: 'user', maxLength: 50 })
  @Column({ length: 50, comment: '所属模块' })
  module: string;

  @ApiProperty({ description: '操作类型', example: 'read', maxLength: 50 })
  @Column({ length: 50, comment: '操作类型：create, read, update, delete, manage' })
  action: string;

  @ApiProperty({ description: '资源路径', example: '/api/users', maxLength: 200, required: false })
  @Column({ length: 200, nullable: true, comment: '资源路径或API端点' })
  resource: string;

  @ApiProperty({ description: '权限状态', enum: ['active', 'inactive'], example: 'active', default: 'active' })
  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active', comment: '权限状态' })
  status: string;

  @ApiProperty({ description: '权限级别', example: 1, minimum: 0, default: 0 })
  @Column({ default: 0, comment: '权限级别，数字越大权限越高' })
  level: number;

  @ApiProperty({ description: '是否为系统内置权限', example: false, default: false })
  @Column({ default: false, comment: '是否为系统内置权限，内置权限不可删除' })
  isSystem: boolean;

  @ApiProperty({ description: '排序权重', example: 100, default: 0 })
  @Column({ default: 0, comment: '排序权重，数字越大排序越靠前' })
  sort: number;

  @ApiProperty({ description: '父权限ID', example: 1, required: false })
  @Column({ nullable: true, comment: '父权限ID，用于构建权限树' })
  parentId: number;

  @ApiProperty({ description: '权限路径', example: '1,2,3', maxLength: 500, required: false })
  @Column({ length: 500, nullable: true, comment: '权限路径，用逗号分隔的ID序列' })
  path: string;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T12:00:00Z' })
  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T12:00:00Z' })
  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '删除时间（软删除）', example: '2024-01-01T12:00:00Z', required: false })
  @DeleteDateColumn({ select: false, type: 'timestamp', comment: '删除时间(软删除)' })
  deletedAt: Date;

  @ApiProperty({ description: '拥有此权限的角色', type: () => [Role], required: false })
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  /**
   * 检查权限是否活跃
   * @returns {boolean} 是否活跃
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * 获取完整的权限标识符
   * @returns {string} 权限标识符
   */
  getFullCode(): string {
    return this.code;
  }

  /**
   * 检查是否为指定模块的权限
   * @param {string} module 模块名
   * @returns {boolean} 是否属于指定模块
   */
  belongsToModule(module: string): boolean {
    return this.module === module;
  }

  /**
   * 检查是否为指定操作的权限
   * @param {string} action 操作类型
   * @returns {boolean} 是否为指定操作
   */
  isAction(action: string): boolean {
    return this.action === action;
  }

  /**
   * 检查权限是否可以被删除
   * @returns {boolean} 是否可删除
   */
  canDelete(): boolean {
    return !this.isSystem;
  }

  /**
   * 生成权限代码
   * @param {string} module 模块名
   * @param {string} action 操作类型
   * @returns {string} 权限代码
   */
  static generateCode(module: string, action: string): string {
    return `${module}:${action}`;
  }

  /**
   * 解析权限代码
   * @param {string} code 权限代码
   * @returns {object} 解析结果
   */
  static parseCode(code: string): { module: string; action: string } {
    const [module, action] = code.split(':');
    return { module: module || '', action: action || '' };
  }

  /**
   * 检查是否为管理权限
   * @returns {boolean} 是否为管理权限
   */
  isManagePermission(): boolean {
    return this.action === 'manage' || this.action === 'admin';
  }
}
