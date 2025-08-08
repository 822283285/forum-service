/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from '../../modules/user/entities/user.entity';
import { PermissionService } from '../services/permission.service';
import { DYNAMIC_PERMISSION_KEY, DynamicPermissionConfig } from '../decorators/dynamic-permission.decorator';

/**
 * 动态权限守卫
 * 支持从数据库实时检查权限状态和资源级权限控制
 */
@Injectable()
export class DynamicPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 注意：如果需要支持公开路由，请实现相应的装饰器和检查逻辑

    // 获取动态权限配置
    const permissionConfig = this.reflector.getAllAndOverride<any>(DYNAMIC_PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!permissionConfig) {
      return true; // 没有权限配置，允许访问
    }

    const request = context.switchToHttp().getRequest<Request & { user?: User }>();
    const user: User | undefined = request.user;

    if (!user) {
      throw new ForbiddenException('用户未认证');
    }

    // 检查用户账户状态
    if (!user.isActive()) {
      throw new ForbiddenException('用户账户已被禁用');
    }

    // 处理多权限配置
    if (permissionConfig.multiple) {
      const hasPermission = await this.checkMultiplePermissions(user, permissionConfig.configs, permissionConfig.operator, context);
      if (!hasPermission) {
        throw new ForbiddenException(`权限不足，需要权限：${this.getPermissionDescription(permissionConfig)}`);
      }
      return true;
    }

    // 处理单个权限配置
    const hasPermission = await this.checkSinglePermission(user, permissionConfig, context);
    if (!hasPermission) {
      throw new ForbiddenException(`权限不足，需要权限：${this.getPermissionDescription(permissionConfig)}`);
    }
    return true;
  }

  /**
   * 检查单个权限
   */
  private async checkSinglePermission(user: User, config: DynamicPermissionConfig, context: ExecutionContext): Promise<boolean> {
    // 自定义权限检查
    if (config.customCheck) {
      try {
        return await config.customCheck(user, context);
      } catch (error) {
        throw new ForbiddenException('权限检查失败');
      }
    }

    // 资源级权限检查
    if (config.checkResource) {
      return this.checkResourcePermission(user, config, context);
    }

    // 权限代码检查
    if (config.code) {
      return this.permissionService.hasDynamicPermission(user, config.code);
    }

    // 模块+操作检查
    if (config.module && config.action) {
      return this.permissionService.hasDynamicModulePermission(user, config.module, config.action);
    }

    throw new ForbiddenException('权限配置无效');
  }

  /**
   * 检查多个权限
   */
  private async checkMultiplePermissions(user: User, configs: DynamicPermissionConfig[], operator: 'AND' | 'OR', context: ExecutionContext): Promise<boolean> {
    const results = await Promise.all(configs.map((config) => this.checkSinglePermission(user, config, context)));

    if (operator === 'AND') {
      return results.every((result) => result);
    } else {
      return results.some((result) => result);
    }
  }

  /**
   * 检查资源级权限
   */
  private async checkResourcePermission(user: User, config: DynamicPermissionConfig, context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    let resource: string = config.resource || '';

    // 如果没有指定资源路径，使用当前请求路径
    if (!resource) {
      resource = request.route?.path || request.url;
    }

    // 处理资源参数替换
    if (config.resourceParam && request.params) {
      const paramValue = request.params[config.resourceParam];
      if (paramValue && resource) {
        resource = resource.replace(`:${config.resourceParam}`, paramValue);
      }
    }

    // 替换所有路由参数
    if (request.params && resource) {
      Object.keys(request.params).forEach((key) => {
        const paramValue = request.params[key];
        if (paramValue && typeof paramValue === 'string') {
          resource = resource.replace(`:${key}`, paramValue);
        }
      });
    }

    const action = config.action || this.getActionFromMethod(request.method);

    return this.permissionService.canAccessResourceDynamic(user, resource, action);
  }

  /**
   * 根据HTTP方法获取操作类型
   */
  private getActionFromMethod(method: string): string {
    const methodActionMap: Record<string, string> = {
      GET: 'read',
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };

    return methodActionMap[method.toUpperCase()] || 'read';
  }

  /**
   * 获取权限描述信息
   */
  private getPermissionDescription(config: any): string {
    if (config.multiple) {
      const descriptions = config.configs.map((c: DynamicPermissionConfig) => this.getSinglePermissionDescription(c));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return descriptions.join(config.operator === 'AND' ? ' 且 ' : ' 或 ');
    }
    return this.getSinglePermissionDescription(config);
  }

  /**
   * 获取单个权限描述
   */
  private getSinglePermissionDescription(config: DynamicPermissionConfig): string {
    if (config.code) {
      return config.code;
    }
    if (config.module && config.action) {
      return `${config.module}:${config.action}`;
    }
    if (config.checkResource) {
      return `资源访问权限(${config.action || 'read'})`;
    }
    return '未知权限';
  }
}
