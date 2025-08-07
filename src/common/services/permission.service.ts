import { Injectable } from '@nestjs/common';
import { User } from '../../modules/user/entities/user.entity';

@Injectable()
export class PermissionService {
  /**
   * 检查用户是否具有指定权限
   * @param user 用户对象
   * @param permissionCode 权限代码
   * @returns 是否具有权限
   */
  hasPermission(user: User, permissionCode: string): boolean {
    if (!user || !user.roles) {
      return false;
    }

    // 检查是否为超级管理员
    if (this.isSuperAdmin(user)) {
      return true;
    }

    return user.hasPermission(permissionCode);
  }

  /**
   * 检查用户是否具有指定角色
   * @param user 用户对象
   * @param roleCode 角色代码
   * @returns 是否具有角色
   */
  hasRole(user: User, roleCode: string): boolean {
    if (!user || !user.roles) {
      return false;
    }

    return user.hasRole(roleCode);
  }

  /**
   * 检查用户是否具有模块权限
   * @param user 用户对象
   * @param module 模块名
   * @param action 操作类型
   * @returns 是否具有权限
   */
  hasModulePermission(user: User, module: string, action: string): boolean {
    if (!user || !user.roles) {
      return false;
    }

    // 检查是否为超级管理员
    if (this.isSuperAdmin(user)) {
      return true;
    }

    return user.hasModulePermission(module, action);
  }

  /**
   * 检查用户权限级别是否满足要求
   * @param user 用户对象
   * @param requiredLevel 所需权限级别
   * @returns 是否满足权限级别要求
   */
  hasPermissionLevel(user: User, requiredLevel: number): boolean {
    if (!user || !user.roles) {
      return false;
    }

    // 检查是否为超级管理员
    if (this.isSuperAdmin(user)) {
      return true;
    }

    const userMaxLevel = this.getUserMaxPermissionLevel(user);
    return userMaxLevel >= requiredLevel;
  }

  /**
   * 获取用户的最高权限级别
   * @param user 用户对象
   * @returns 最高权限级别
   */
  getUserMaxPermissionLevel(user: User): number {
    if (!user || !user.roles || user.roles.length === 0) {
      return 0;
    }

    let maxLevel = 0;
    for (const role of user.roles) {
      if (role.level > maxLevel) {
        maxLevel = role.level;
      }

      if (role.permissions) {
        for (const permission of role.permissions) {
          if (permission.level > maxLevel) {
            maxLevel = permission.level;
          }
        }
      }
    }

    return maxLevel;
  }

  /**
   * 获取用户所有权限代码
   * @param user 用户对象
   * @returns 权限代码数组
   */
  getUserPermissions(user: User): string[] {
    if (!user || !user.roles) {
      return [];
    }

    return user.getAllPermissions();
  }

  /**
   * 获取用户指定模块的权限
   * @param user 用户对象
   * @param module 模块名
   * @returns 权限代码数组
   */
  getUserModulePermissions(user: User, module: string): string[] {
    if (!user || !user.roles) {
      return [];
    }

    return user.getModulePermissions(module);
  }

  /**
   * 检查是否为超级管理员
   * @param user 用户对象
   * @returns 是否为超级管理员
   */
  isSuperAdmin(user: User): boolean {
    if (!user || !user.roles) {
      return false;
    }

    return user.isAdmin();
  }

  /**
   * 检查用户是否可以访问资源
   * @param user 用户对象
   * @param resource 资源路径
   * @param action 操作类型
   * @returns 是否可以访问
   */
  canAccessResource(user: User, resource: string, action: string): boolean {
    if (!user || !user.roles) {
      return false;
    }

    // 检查是否为超级管理员
    if (this.isSuperAdmin(user)) {
      return true;
    }

    // 根据资源路径解析模块名
    const module = this.parseModuleFromResource(resource);
    if (module) {
      return this.hasModulePermission(user, module, action);
    }

    return false;
  }

  /**
   * 从资源路径解析模块名
   * @param resource 资源路径
   * @returns 模块名
   */
  private parseModuleFromResource(resource: string): string | null {
    // 解析 /api/users -> user
    // 解析 /api/permissions -> permission
    const match = resource.match(/^\/api\/([^/]+)/);
    if (match) {
      const module = match[1];
      // 处理复数形式
      if (module.endsWith('s')) {
        return module.slice(0, -1);
      }
      return module;
    }
    return null;
  }

  /**
   * 验证权限代码格式
   * @param permissionCode 权限代码
   * @returns 是否为有效格式
   */
  isValidPermissionCode(permissionCode: string): boolean {
    const pattern = /^[a-zA-Z_][a-zA-Z0-9_]*:[a-zA-Z_][a-zA-Z0-9_]*$/;
    return pattern.test(permissionCode);
  }

  /**
   * 解析权限代码
   * @param permissionCode 权限代码
   * @returns 模块和操作
   */
  parsePermissionCode(permissionCode: string): { module: string; action: string } | null {
    if (!this.isValidPermissionCode(permissionCode)) {
      return null;
    }

    const [module, action] = permissionCode.split(':');
    return { module, action };
  }
}
