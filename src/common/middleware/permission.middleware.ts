import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { User } from '../../modules/user/entities/user.entity';

/**
 * 权限中间件
 * 用于记录权限验证相关的日志
 */
@Injectable()
export class PermissionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(PermissionMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || '';

    // 记录请求开始
    this.logger.debug(`权限验证开始: ${method} ${originalUrl} - IP: ${ip}`);

    // 在响应结束时记录权限验证结果
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const user: User = (req as any).user;

      // 构建日志信息
      const logData = {
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
        ip,
        userAgent,
        user: user
          ? {
              id: user.id,
              username: user.username,
              roles: user.roles?.map((role) => role.code) || [],
            }
          : null,
      };

      // 根据状态码记录不同级别的日志
      if (statusCode >= 400) {
        if (statusCode === 401) {
          this.logger.warn(`认证失败: ${JSON.stringify(logData)}`);
        } else if (statusCode === 403) {
          this.logger.warn(`权限不足: ${JSON.stringify(logData)}`);
        } else {
          this.logger.error(`请求失败: ${JSON.stringify(logData)}`);
        }
      } else {
        this.logger.log(`权限验证成功: ${method} ${originalUrl} - 用户: ${user?.username || '匿名'} - ${duration}ms`);
      }
    });

    next();
  }
}
