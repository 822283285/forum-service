/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { RedisService } from '../../core/cache/redis.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/auth-response.dto';
import { User } from '../user/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 用户登录
   * @param loginDto 登录数据
   * @param ip 登录IP
   * @returns 令牌响应
   */
  async login(loginDto: LoginDto, ip?: string): Promise<TokenResponseDto> {
    // 根据用户名类型查找用户
    let user: User | null = null;

    // 判断是邮箱、手机号还是用户名
    if (loginDto.username.includes('@')) {
      user = await this.userService.findByEmail(loginDto.username);
    } else if (/^1[3-9]\d{9}$/.test(loginDto.username)) {
      user = await this.userService.findByPhone(loginDto.username);
    } else {
      user = await this.userService.findByUsername(loginDto.username);
    }

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await this.userService.validatePassword(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw new UnauthorizedException('账户已被禁用，请联系管理员');
    }

    // 更新最后登录时间
    await this.userService.updateLastLogin(user.id, ip);

    // 清除用户之前的所有token（强制单点登录）
    await this.redisService.removeRefreshToken(user.id);
    await this.redisService.removeUserSession(user.id);

    // 生成JWT令牌
    const tokens = await this.generateTokens(user);

    // 存储新的刷新token
    const refreshTokenExpiry = this.parseExpiryToSeconds(this.configService.get<string>('app.security.jwtRefreshExpiresIn') || '30d');
    await this.redisService.storeRefreshToken(user.id, tokens.refreshToken, refreshTokenExpiry);

    // 存储用户会话信息
    await this.redisService.storeUserSession(user.id, tokens.accessToken, this.parseExpiryToSeconds(this.configService.get<string>('app.security.jwtExpiresIn') || '1h'));

    return tokens;
  }

  /**
   * 用户注册
   * @param registerDto 注册数据
   * @param ip 注册IP
   * @returns 令牌响应
   */
  async register(registerDto: RegisterDto, ip?: string): Promise<TokenResponseDto> {
    // 检查用户名是否已存在
    const existingUser = await this.userService.findByUsername(registerDto.username);
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.userService.findByEmail(registerDto.email);
    if (existingEmail) {
      throw new ConflictException('邮箱已存在');
    }

    // 检查手机号是否已存在（如果提供）
    if (registerDto.phone) {
      const existingPhone = await this.userService.findByPhone(registerDto.phone);
      if (existingPhone) {
        throw new ConflictException('手机号已存在');
      }
    }

    // 创建用户
    const user = await this.userService.create(registerDto, ip);

    // 生成JWT令牌
    const tokens = await this.generateTokens(user);

    // 存储刷新token
    const refreshTokenExpiry = this.parseExpiryToSeconds(this.configService.get<string>('app.security.jwtRefreshExpiresIn') || '30d');
    await this.redisService.storeRefreshToken(user.id, tokens.refreshToken, refreshTokenExpiry);

    // 存储用户会话信息
    await this.redisService.storeUserSession(user.id, tokens.accessToken, this.parseExpiryToSeconds(this.configService.get<string>('app.security.jwtExpiresIn') || '1h'));

    return tokens;
  }

  /**
   * 刷新令牌
   * @param refreshToken 刷新令牌
   * @returns 新的令牌响应
   */
  async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
    try {
      // 检查刷新token是否在黑名单中
      const isBlacklisted = await this.redisService.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new UnauthorizedException('刷新令牌已失效');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('app.security.jwtRefreshSecret') || 'your-refresh-secret',
      }) as JwtPayload;

      const user = await this.userService.findOne(payload.sub);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('无效的刷新令牌');
      }

      // 验证刷新token是否与存储的匹配
      const isValidRefreshToken = await this.redisService.validateRefreshToken(user.id, refreshToken);
      if (!isValidRefreshToken) {
        throw new UnauthorizedException('刷新令牌不匹配');
      }

      // 将旧的刷新token加入黑名单
      const refreshTokenExpiry = this.parseExpiryToSeconds(this.configService.get<string>('app.security.jwtRefreshExpiresIn') || '30d');
      await this.redisService.blacklistToken(refreshToken, refreshTokenExpiry);

      // 生成新的令牌
      const tokens = await this.generateTokens(user);

      // 存储新的刷新token
      await this.redisService.storeRefreshToken(user.id, tokens.refreshToken, refreshTokenExpiry);

      // 存储新的用户会话信息
      await this.redisService.storeUserSession(user.id, tokens.accessToken, this.parseExpiryToSeconds(this.configService.get<string>('app.security.jwtExpiresIn') || '1h'));

      return tokens;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  /**
   * 用户登出
   * @param userId 用户ID
   * @param accessToken 访问token
   * @param refreshToken 刷新token（可选）
   */
  async logout(userId: number, accessToken: string, refreshToken?: string): Promise<void> {
    try {
      // 获取访问token的剩余过期时间
      const payload = this.jwtService.decode(accessToken) as any;
      const currentTime = Math.floor(Date.now() / 1000);
      const accessTokenExpiresIn = payload?.exp ? payload.exp - currentTime : 0;

      // 清除用户所有token
      await this.redisService.clearUserTokens(userId, accessToken, refreshToken, Math.max(accessTokenExpiresIn, 0));
    } catch (error) {
      console.error('登出时发生错误:', error);
      // 即使发生错误也要尝试清除token
      await this.redisService.removeRefreshToken(userId);
      await this.redisService.removeUserSession(userId);
    }
  }

  /**
   * 验证token是否有效（未在黑名单中）
   * @param token JWT token
   * @returns 是否有效
   */
  async validateToken(token: string): Promise<boolean> {
    return !(await this.redisService.isTokenBlacklisted(token));
  }

  /**
   * 解析过期时间字符串为秒数
   * @param expiryString 过期时间字符串（如 '7d', '24h', '30m'）
   * @returns 秒数
   */
  private parseExpiryToSeconds(expiryString: string): number {
    const match = expiryString.match(/^(\d+)([dhms])$/);
    if (!match) {
      throw new Error(`无效的过期时间格式: ${expiryString}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'd': // 天
        return value * 24 * 60 * 60;
      case 'h': // 小时
        return value * 60 * 60;
      case 'm': // 分钟
        return value * 60;
      case 's': // 秒
        return value;
      default:
        throw new Error(`不支持的时间单位: ${unit}`);
    }
  }

  /**
   * 生成JWT令牌
   * @param user 用户信息
   * @returns 令牌信息
   */
  private async generateTokens(user: User): Promise<TokenResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const accessTokenExpiry = this.configService.get<string>('app.security.jwtExpiresIn') || '1h';
    const refreshTokenExpiry = this.configService.get<string>('app.security.jwtRefreshExpiresIn') || '7d';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const tokens = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('app.security.jwtSecret') || 'your-secret-key',
        expiresIn: accessTokenExpiry,
      }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('app.security.jwtRefreshSecret') || 'your-refresh-secret',
        expiresIn: refreshTokenExpiry,
      }),
    ]);
    const [accessToken, refreshToken] = tokens as [string, string];

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.parseExpiryToSeconds(accessTokenExpiry),
    };
  }
}
