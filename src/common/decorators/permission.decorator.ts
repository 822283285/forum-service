import { SetMetadata } from '@nestjs/common';

/**
 * 权限装饰器的元数据键
 */
export const PERMISSION_KEY = 'permission';

/**
 * 权限装饰器
 * 用于标记接口需要的权限
 * @param permission 权限代码，格式：模块:操作，如 'user:read'
 */
export const RequirePermission = (permission: string) => SetMetadata(PERMISSION_KEY, permission);

/**
 * 多权限装饰器
 * 用于标记接口需要多个权限中的任意一个
 * @param permissions 权限代码数组
 */
export const RequireAnyPermission = (permissions: string[]) => SetMetadata(PERMISSION_KEY, permissions);

/**
 * 角色装饰器的元数据键
 */
export const ROLE_KEY = 'role';

/**
 * 角色装饰器
 * 用于标记接口需要的角色
 * @param role 角色代码，如 'admin'
 */
export const RequireRole = (role: string) => SetMetadata(ROLE_KEY, role);

/**
 * 多角色装饰器
 * 用于标记接口需要多个角色中的任意一个
 * @param roles 角色代码数组
 */
export const RequireAnyRole = (roles: string[]) => SetMetadata(ROLE_KEY, roles);

/**
 * 权限级别装饰器的元数据键
 */
export const PERMISSION_LEVEL_KEY = 'permission_level';

/**
 * 权限级别装饰器
 * 用于标记接口需要的最低权限级别
 * @param level 权限级别，数字越大权限越高
 */
export const RequirePermissionLevel = (level: number) => SetMetadata(PERMISSION_LEVEL_KEY, level);
