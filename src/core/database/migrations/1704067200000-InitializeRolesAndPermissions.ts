/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 初始化角色和权限数据迁移
 * 创建基础的角色和权限数据，为论坛系统提供完整的权限控制
 */
export class InitializeRolesAndPermissions1704067200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 插入基础权限数据
    await this.insertPermissions(queryRunner);

    // 2. 插入基础角色数据
    await this.insertRoles(queryRunner);

    // 3. 分配角色权限
    await this.assignRolePermissions(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 清理角色权限关联
    await queryRunner.query('DELETE FROM role_permissions');

    // 清理角色数据
    await queryRunner.query('DELETE FROM roles WHERE isSystem = 1');

    // 清理权限数据
    await queryRunner.query('DELETE FROM permissions WHERE isSystem = 1');
  }

  /**
   * 插入基础权限数据
   */
  private async insertPermissions(queryRunner: QueryRunner): Promise<void> {
    const permissions = [
      // 用户管理权限
      { name: '创建用户', code: 'user:create', description: '创建新用户账户', module: 'user', action: 'create', resource: '/api/users', level: 1, isSystem: true },
      { name: '查看用户', code: 'user:read', description: '查看用户信息和列表', module: 'user', action: 'read', resource: '/api/users', level: 1, isSystem: true },
      { name: '更新用户', code: 'user:update', description: '更新用户信息', module: 'user', action: 'update', resource: '/api/users', level: 2, isSystem: true },
      { name: '删除用户', code: 'user:delete', description: '删除用户账户', module: 'user', action: 'delete', resource: '/api/users', level: 3, isSystem: true },
      { name: '用户管理', code: 'user:manage', description: '用户管理的所有权限', module: 'user', action: 'manage', resource: '/api/users', level: 5, isSystem: true },
      { name: '查看自己信息', code: 'user:read:self', description: '查看自己的用户信息', module: 'user', action: 'read', resource: '/api/users/profile', level: 0, isSystem: true },

      // 角色管理权限
      { name: '创建角色', code: 'role:create', description: '创建新角色', module: 'role', action: 'create', resource: '/api/roles', level: 3, isSystem: true },
      { name: '查看角色', code: 'role:read', description: '查看角色信息和列表', module: 'role', action: 'read', resource: '/api/roles', level: 2, isSystem: true },
      { name: '更新角色', code: 'role:update', description: '更新角色信息', module: 'role', action: 'update', resource: '/api/roles', level: 3, isSystem: true },
      { name: '删除角色', code: 'role:delete', description: '删除角色', module: 'role', action: 'delete', resource: '/api/roles', level: 4, isSystem: true },
      { name: '角色管理', code: 'role:manage', description: '角色管理的所有权限', module: 'role', action: 'manage', resource: '/api/roles', level: 5, isSystem: true },

      // 权限管理权限
      { name: '创建权限', code: 'permission:create', description: '创建新权限', module: 'permission', action: 'create', resource: '/api/permissions', level: 4, isSystem: true },
      { name: '查看权限', code: 'permission:read', description: '查看权限信息和列表', module: 'permission', action: 'read', resource: '/api/permissions', level: 2, isSystem: true },
      { name: '更新权限', code: 'permission:update', description: '更新权限信息', module: 'permission', action: 'update', resource: '/api/permissions', level: 4, isSystem: true },
      { name: '删除权限', code: 'permission:delete', description: '删除权限', module: 'permission', action: 'delete', resource: '/api/permissions', level: 5, isSystem: true },
      { name: '权限管理', code: 'permission:manage', description: '权限管理的所有权限', module: 'permission', action: 'manage', resource: '/api/permissions', level: 5, isSystem: true },

      // 菜单管理权限
      { name: '创建菜单', code: 'menu:create', description: '创建新菜单', module: 'menu', action: 'create', resource: '/api/menus', level: 2, isSystem: true },
      { name: '查看菜单', code: 'menu:read', description: '查看菜单信息和列表', module: 'menu', action: 'read', resource: '/api/menus', level: 1, isSystem: true },
      { name: '更新菜单', code: 'menu:update', description: '更新菜单信息', module: 'menu', action: 'update', resource: '/api/menus', level: 2, isSystem: true },
      { name: '删除菜单', code: 'menu:delete', description: '删除菜单', module: 'menu', action: 'delete', resource: '/api/menus', level: 3, isSystem: true },
      { name: '菜单管理', code: 'menu:manage', description: '菜单管理的所有权限', module: 'menu', action: 'manage', resource: '/api/menus', level: 5, isSystem: true },

      // 论坛核心功能权限（预留）
      { name: '发布帖子', code: 'post:create', description: '发布新帖子', module: 'post', action: 'create', resource: '/api/posts', level: 0, isSystem: true },
      { name: '查看帖子', code: 'post:read', description: '查看帖子内容', module: 'post', action: 'read', resource: '/api/posts', level: 0, isSystem: true },
      { name: '编辑帖子', code: 'post:update', description: '编辑自己的帖子', module: 'post', action: 'update', resource: '/api/posts', level: 0, isSystem: true },
      { name: '删除帖子', code: 'post:delete', description: '删除帖子', module: 'post', action: 'delete', resource: '/api/posts', level: 1, isSystem: true },
      { name: '帖子管理', code: 'post:manage', description: '帖子管理的所有权限', module: 'post', action: 'manage', resource: '/api/posts', level: 3, isSystem: true },

      { name: '发布评论', code: 'comment:create', description: '发布评论', module: 'comment', action: 'create', resource: '/api/comments', level: 0, isSystem: true },
      { name: '查看评论', code: 'comment:read', description: '查看评论内容', module: 'comment', action: 'read', resource: '/api/comments', level: 0, isSystem: true },
      { name: '编辑评论', code: 'comment:update', description: '编辑自己的评论', module: 'comment', action: 'update', resource: '/api/comments', level: 0, isSystem: true },
      { name: '删除评论', code: 'comment:delete', description: '删除评论', module: 'comment', action: 'delete', resource: '/api/comments', level: 1, isSystem: true },
      { name: '评论管理', code: 'comment:manage', description: '评论管理的所有权限', module: 'comment', action: 'manage', resource: '/api/comments', level: 3, isSystem: true },

      // 系统管理权限
      { name: '系统配置', code: 'system:config', description: '系统配置管理', module: 'system', action: 'manage', resource: '/api/system', level: 5, isSystem: true },
      { name: '系统监控', code: 'system:monitor', description: '系统监控和统计', module: 'system', action: 'read', resource: '/api/system/monitor', level: 4, isSystem: true },
      { name: '日志管理', code: 'system:logs', description: '查看和管理系统日志', module: 'system', action: 'read', resource: '/api/system/logs', level: 3, isSystem: true },
    ];

    for (const permission of permissions) {
      await queryRunner.query(
        `INSERT INTO permissions (name, code, description, module, action, resource, level, isSystem, status, sort, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, NOW(), NOW())`,
        [permission.name, permission.code, permission.description, permission.module, permission.action, permission.resource, permission.level, permission.isSystem],
      );
    }
  }

  /**
   * 插入基础角色数据
   */
  private async insertRoles(queryRunner: QueryRunner): Promise<void> {
    const roles = [
      {
        name: '超级管理员',
        code: 'super_admin',
        description: '系统超级管理员，拥有所有权限',
        level: 10,
        isSystem: true,
        sort: 1000,
      },
      {
        name: '管理员',
        code: 'admin',
        description: '系统管理员，拥有大部分管理权限',
        level: 8,
        isSystem: true,
        sort: 800,
      },
      {
        name: '版主',
        code: 'moderator',
        description: '论坛版主，负责内容审核和管理',
        level: 5,
        isSystem: true,
        sort: 500,
      },
      {
        name: '高级用户',
        code: 'vip_user',
        description: '高级用户，拥有更多论坛功能权限',
        level: 3,
        isSystem: true,
        sort: 300,
      },
      {
        name: '普通用户',
        code: 'user',
        description: '普通注册用户，拥有基本的论坛功能权限',
        level: 1,
        isSystem: true,
        sort: 100,
      },
      {
        name: '游客',
        code: 'guest',
        description: '未注册用户，只能查看公开内容',
        level: 0,
        isSystem: true,
        sort: 0,
      },
    ];

    for (const role of roles) {
      await queryRunner.query(
        `INSERT INTO roles (name, code, description, level, isSystem, sort, status, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
        [role.name, role.code, role.description, role.level, role.isSystem, role.sort],
      );
    }
  }

  /**
   * 分配角色权限
   */
  private async assignRolePermissions(queryRunner: QueryRunner): Promise<void> {
    // 超级管理员：拥有所有权限
    const superAdminPermissions = await queryRunner.query('SELECT id FROM permissions WHERE isSystem = 1');
    const superAdminRoleId = await queryRunner.query("SELECT id FROM roles WHERE code = 'super_admin'");

    for (const permission of superAdminPermissions) {
      await queryRunner.query('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [superAdminRoleId[0].id, permission.id]);
    }

    // 管理员：除了系统最高级权限外的所有权限
    const adminPermissions = await queryRunner.query('SELECT id FROM permissions WHERE isSystem = 1 AND level <= 4');
    const adminRoleId = await queryRunner.query("SELECT id FROM roles WHERE code = 'admin'");

    for (const permission of adminPermissions) {
      await queryRunner.query('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [adminRoleId[0].id, permission.id]);
    }

    // 版主：内容管理相关权限
    const moderatorPermissionCodes = [
      'user:read',
      'user:read:self',
      'role:read',
      'permission:read',
      'menu:read',
      'post:create',
      'post:read',
      'post:update',
      'post:delete',
      'post:manage',
      'comment:create',
      'comment:read',
      'comment:update',
      'comment:delete',
      'comment:manage',
      'system:logs',
    ];
    const moderatorRoleId = await queryRunner.query("SELECT id FROM roles WHERE code = 'moderator'");

    for (const code of moderatorPermissionCodes) {
      const permission = await queryRunner.query('SELECT id FROM permissions WHERE code = ?', [code]);
      if (permission.length > 0) {
        await queryRunner.query('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [moderatorRoleId[0].id, permission[0].id]);
      }
    }

    // 高级用户：基本功能 + 部分高级功能
    const vipUserPermissionCodes = [
      'user:read:self',
      'role:read',
      'permission:read',
      'menu:read',
      'post:create',
      'post:read',
      'post:update',
      'post:delete',
      'comment:create',
      'comment:read',
      'comment:update',
      'comment:delete',
    ];
    const vipUserRoleId = await queryRunner.query("SELECT id FROM roles WHERE code = 'vip_user'");

    for (const code of vipUserPermissionCodes) {
      const permission = await queryRunner.query('SELECT id FROM permissions WHERE code = ?', [code]);
      if (permission.length > 0) {
        await queryRunner.query('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [vipUserRoleId[0].id, permission[0].id]);
      }
    }

    // 普通用户：基本论坛功能
    const userPermissionCodes = ['user:read:self', 'menu:read', 'post:create', 'post:read', 'post:update', 'comment:create', 'comment:read', 'comment:update'];
    const userRoleId = await queryRunner.query("SELECT id FROM roles WHERE code = 'user'");

    for (const code of userPermissionCodes) {
      const permission = await queryRunner.query('SELECT id FROM permissions WHERE code = ?', [code]);
      if (permission.length > 0) {
        await queryRunner.query('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [userRoleId[0].id, permission[0].id]);
      }
    }

    // 游客：只读权限
    const guestPermissionCodes = ['post:read', 'comment:read', 'menu:read'];
    const guestRoleId = await queryRunner.query("SELECT id FROM roles WHERE code = 'guest'");

    for (const code of guestPermissionCodes) {
      const permission = await queryRunner.query('SELECT id FROM permissions WHERE code = ?', [code]);
      if (permission.length > 0) {
        await queryRunner.query('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [guestRoleId[0].id, permission[0].id]);
      }
    }
  }
}
