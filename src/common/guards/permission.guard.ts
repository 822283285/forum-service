import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, ROLE_KEY, PERMISSION_LEVEL_KEY } from '../decorators/permission.decorator';
import { IS_PUBLIC_KEY } from '../../modules/auth/decorators/public.decorator';
import { User } from '../../modules/user/entities/user.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 检查是否为公开接口
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

    if (isPublic) {
      return true;
    }

    // 获取请求对象和用户信息
    const request = context.switchToHttp().getRequest<Request & { user?: User }>();
    const user: User | undefined = request.user;

    if (!user) {
      throw new ForbiddenException('用户未认证');
    }

    // 检查用户状态
    if (!user.isActive()) {
      throw new ForbiddenException('用户账户已被禁用');
    }

    // 检查权限级别
    const requiredLevel = this.reflector.getAllAndOverride<number>(PERMISSION_LEVEL_KEY, [context.getHandler(), context.getClass()]);

    if (requiredLevel !== undefined) {
      const userMaxLevel = this.getUserMaxPermissionLevel(user);
      if (userMaxLevel < requiredLevel) {
        throw new ForbiddenException(`权限不足，需要权限级别 ${requiredLevel}，当前级别 ${userMaxLevel}`);
      }
    }

    // 检查角色权限
    const requiredRoles = this.reflector.getAllAndOverride<string | string[]>(ROLE_KEY, [context.getHandler(), context.getClass()]);

    if (requiredRoles) {
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      const hasRole = roles.some((role) => user.hasRole(role));

      if (!hasRole) {
        throw new ForbiddenException(`权限不足，需要角色：${roles.join(' 或 ')}`);
      }
    }

    // 检查具体权限
    const requiredPermissions = this.reflector.getAllAndOverride<string | string[]>(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (requiredPermissions) {
      const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
      const hasPermission = permissions.some((permission) => user.hasPermission(permission));

      if (!hasPermission) {
        throw new ForbiddenException(`权限不足，需要权限：${permissions.join(' 或 ')}`);
      }
    }

    return true;
  }

  /**
   * 获取用户的最高权限级别
   */
  private getUserMaxPermissionLevel(user: User): number {
    if (!user.roles || user.roles.length === 0) {
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
}
