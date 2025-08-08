import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { User } from '../../user/entities/user.entity';
import { RedisService } from '../../../core/cache/redis.service';
import { Request } from 'express';

export interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.security.jwtSecret') || 'your-secret-key',
      passReqToCallback: true, // 允许在validate方法中访问request对象
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<User> {
    // 从请求头获取token
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || '';

    // 检查token是否在黑名单中
    const isBlacklisted = await this.redisService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('令牌已失效');
    }

    // 验证用户会话是否有效
    const isSessionValid = await this.redisService.isUserSessionValid(payload.sub, token);
    if (!isSessionValid) {
      throw new UnauthorizedException('会话已失效，请重新登录');
    }

    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    if (user.status !== 'active') {
      throw new UnauthorizedException('用户已被禁用');
    }
    return user;
  }
}
