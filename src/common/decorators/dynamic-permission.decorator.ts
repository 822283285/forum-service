import { ExecutionContext, SetMetadata } from '@nestjs/common';

/**
 * 动态权限装饰器的元数据键
 */
export const DYNAMIC_PERMISSION_KEY = 'dynamic_permission';

/**
 * 动态权限配置接口
 */
export interface DynamicPermissionConfig {
  /** 权限代码 */
  code?: string;
  /** 模块名称 */
  module?: string;
  /** 操作类型 */
  action?: string;
  /** 资源路径 */
  resource?: string;
  /** 是否检查资源级权限 */
  checkResource?: boolean;
  /** 资源参数名称（用于从路由参数中提取资源ID） */
  resourceParam?: string;
  /** 自定义权限检查函数 */
  customCheck?: (user: any, context: ExecutionContext) => Promise<boolean> | boolean;
}

/**
 * 动态权限装饰器
 * 支持从数据库实时检查权限状态
 *
 * @param config 权限配置
 * @returns 装饰器函数
 *
 * @example
 * ```typescript
 * // 基本用法
 * @DynamicPermission({ code: 'user:read' })
 * async getUsers() {}
 *
 * // 模块+操作
 * @DynamicPermission({ module: 'user', action: 'create' })
 * async createUser() {}
 *
 * // 资源级权限
 * @DynamicPermission({
 *   resource: '/api/posts/:id',
 *   action: 'read',
 *   checkResource: true
 * })
 * async getPost() {}
 *
 * // 自定义检查
 * @DynamicPermission({
 *   customCheck: async (user, context) => {
 *     // 自定义权限逻辑
 *     return user.id === context.params.userId;
 *   }
 * })
 * async getUserProfile() {}
 * ```
 */
export const DynamicPermission = (config: DynamicPermissionConfig) => {
  return SetMetadata(DYNAMIC_PERMISSION_KEY, config);
};

/**
 * 动态权限组合装饰器
 * 支持多个权限条件的组合检查
 *
 * @param configs 权限配置数组
 * @param operator 逻辑操作符：'AND' | 'OR'
 * @returns 装饰器函数
 *
 * @example
 * ```typescript
 * // AND 操作：需要同时满足所有权限
 * @DynamicPermissions([
 *   { code: 'user:read' },
 *   { code: 'user:manage' }
 * ], 'AND')
 * async manageUsers() {}
 *
 * // OR 操作：满足任一权限即可
 * @DynamicPermissions([
 *   { code: 'admin:all' },
 *   { code: 'user:manage' }
 * ], 'OR')
 * async adminOrUserManager() {}
 * ```
 */
export const DynamicPermissions = (configs: DynamicPermissionConfig[], operator: 'AND' | 'OR' = 'AND') => {
  return SetMetadata(DYNAMIC_PERMISSION_KEY, {
    multiple: true,
    configs,
    operator,
  });
};

/**
 * 动态资源权限装饰器
 * 专门用于资源级权限检查
 *
 * @param action 操作类型
 * @param resourceParam 资源参数名（从路由参数中获取）
 * @returns 装饰器函数
 *
 * @example
 * ```typescript
 * @DynamicResourcePermission('read', 'id')
 * async getPost(@Param('id') id: string) {
 *   // 会检查用户是否有访问 /api/posts/{id} 的 read 权限
 * }
 *
 * @DynamicResourcePermission('update', 'userId')
 * async updateUser(@Param('userId') userId: string) {
 *   // 会检查用户是否有访问 /api/users/{userId} 的 update 权限
 * }
 * ```
 */
export const DynamicResourcePermission = (action: string, resourceParam?: string) => {
  return SetMetadata(DYNAMIC_PERMISSION_KEY, {
    checkResource: true,
    action,
    resourceParam,
  });
};
