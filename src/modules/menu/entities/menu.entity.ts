import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '../../permission/entities/permission.entity';

@Index(['status', 'createdAt'])
@Index(['parentId', 'sort'])
@Entity('menus')
export class Menu {
  @ApiProperty({ description: '菜单ID', example: 1 })
  @PrimaryGeneratedColumn({ comment: '菜单ID' })
  id: number;

  @ApiProperty({ description: '菜单名称', example: '用户管理', maxLength: 50 })
  @Column({ length: 50, comment: '菜单名称' })
  name: string;

  @ApiProperty({ description: '菜单标题', example: '用户管理', maxLength: 50 })
  @Column({ length: 50, comment: '菜单标题，用于显示' })
  title: string;

  @ApiProperty({ description: '菜单图标', example: 'user', maxLength: 50, required: false })
  @Column({ length: 50, nullable: true, comment: '菜单图标' })
  icon: string;

  @ApiProperty({ description: '路由路径', example: '/users', maxLength: 200 })
  @Column({ length: 200, comment: '前端路由路径' })
  path: string;

  @ApiProperty({ description: '组件路径', example: 'views/user/index.vue', maxLength: 200, required: false })
  @Column({ length: 200, nullable: true, comment: '前端组件路径' })
  component: string;

  @ApiProperty({ description: '重定向路径', example: '/users/list', maxLength: 200, required: false })
  @Column({ length: 200, nullable: true, comment: '重定向路径' })
  redirect: string;

  @ApiProperty({ description: '菜单类型', enum: ['directory', 'menu', 'button'], example: 'menu' })
  @Column({ type: 'enum', enum: ['directory', 'menu', 'button'], comment: '菜单类型：目录、菜单、按钮' })
  type: string;

  @ApiProperty({ description: '菜单状态', enum: ['active', 'inactive'], example: 'active', default: 'active' })
  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active', comment: '菜单状态' })
  status: string;

  @ApiProperty({ description: '是否隐藏', example: false, default: false })
  @Column({ default: false, comment: '是否在菜单中隐藏' })
  hidden: boolean;

  @ApiProperty({ description: '是否缓存', example: true, default: true })
  @Column({ default: true, comment: '是否缓存页面' })
  keepAlive: boolean;

  @ApiProperty({ description: '是否固定标签页', example: false, default: false })
  @Column({ default: false, comment: '是否固定在标签页' })
  affix: boolean;

  @ApiProperty({ description: '排序权重', example: 100, default: 0 })
  @Column({ default: 0, comment: '排序权重，数字越大排序越靠前' })
  sort: number;

  @ApiProperty({ description: '父菜单ID', example: 1, required: false })
  @Column({ nullable: true, comment: '父菜单ID，用于构建菜单树' })
  parentId: number;

  @ApiProperty({ description: '菜单路径', example: '1,2,3', maxLength: 500, required: false })
  @Column({ length: 500, nullable: true, comment: '菜单路径，用逗号分隔的ID序列' })
  menuPath: string;

  @ApiProperty({ description: '外部链接', example: 'https://example.com', maxLength: 500, required: false })
  @Column({ length: 500, nullable: true, comment: '外部链接地址' })
  externalLink: string;

  @ApiProperty({ description: '是否为系统内置菜单', example: false, default: false })
  @Column({ default: false, comment: '是否为系统内置菜单，内置菜单不可删除' })
  isSystem: boolean;

  @ApiProperty({ description: '菜单描述', example: '用户管理相关功能', maxLength: 500, required: false })
  @Column({ length: 500, nullable: true, comment: '菜单描述' })
  description: string;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T12:00:00Z' })
  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T12:00:00Z' })
  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '删除时间（软删除）', example: '2024-01-01T12:00:00Z', required: false })
  @DeleteDateColumn({ select: false, type: 'timestamp', nullable: true, comment: '删除时间' })
  deletedAt: Date;

  @ApiProperty({ description: '关联权限', type: () => [Permission] })
  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'menu_permissions',
    joinColumn: { name: 'menu_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  /**
   * 检查菜单是否激活
   * @returns {boolean} 是否激活
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * 检查是否为目录类型
   * @returns {boolean} 是否为目录
   */
  isDirectory(): boolean {
    return this.type === 'directory';
  }

  /**
   * 检查是否为菜单类型
   * @returns {boolean} 是否为菜单
   */
  isMenu(): boolean {
    return this.type === 'menu';
  }

  /**
   * 检查是否为按钮类型
   * @returns {boolean} 是否为按钮
   */
  isButton(): boolean {
    return this.type === 'button';
  }

  /**
   * 检查是否为外部链接
   * @returns {boolean} 是否为外部链接
   */
  isExternalLink(): boolean {
    return !!this.externalLink;
  }

  /**
   * 检查菜单是否可以被删除
   * @returns {boolean} 是否可删除
   */
  canDelete(): boolean {
    return !this.isSystem;
  }

  /**
   * 获取完整路径
   * @returns {string} 完整路径
   */
  getFullPath(): string {
    return this.externalLink || this.path;
  }
}
