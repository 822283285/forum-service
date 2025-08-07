import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { PermissionService } from '../services/permission.service';
import { User } from '../../modules/user/entities/user.entity';
import { IS_PUBLIC_KEY } from '../../modules/auth/decorators/public.decorator';

/**
 * 权限拦截器
 * 在响应中添加用户权限信息
 */
@Injectable()
export class PermissionInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 检查是否为公开接口
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

    if (isPublic) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request & { user?: User }>();
    const user: User | undefined = request.user;

    return next.handle().pipe(
      map((data: any) => {
        // 如果用户已认证，添加权限信息到响应头
        if (user) {
          const response = context.switchToHttp().getResponse<Response>();

          // 添加用户权限信息到响应头
          response.setHeader(
            'X-User-Permissions',
            JSON.stringify({
              userId: user.id,
              username: user.username,
              roles: user.roles?.map((role) => role.code) || [],
              permissions: this.permissionService.getUserPermissions(user),
              permissionLevel: this.permissionService.getUserMaxPermissionLevel(user),
              isAdmin: this.permissionService.isSuperAdmin(user),
            }),
          );
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return data;
      }),
    );
  }
}
