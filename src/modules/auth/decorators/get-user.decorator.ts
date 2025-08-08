import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';

/**
 * 获取当前用户装饰器
 * 从请求对象中提取用户信息
 */
export const GetUser = createParamDecorator((data: unknown, ctx: ExecutionContext): User => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const request = ctx.switchToHttp().getRequest();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return request.user;
});
