import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private readonly tokenBlacklistPrefix: string;
  private readonly refreshTokenPrefix: string;
  private readonly userSessionPrefix: string;

  constructor(private readonly configService: ConfigService) {
    this.tokenBlacklistPrefix = this.configService.get<string>('redis.tokenBlacklistPrefix') || 'blacklist:token:';
    this.refreshTokenPrefix = this.configService.get<string>('redis.refreshTokenPrefix') || 'refresh:token:';
    this.userSessionPrefix = this.configService.get<string>('redis.userSessionPrefix') || 'session:user:';
  }

  async onModuleInit() {
    try {
      this.client = new Redis({
        host: this.configService.get<string>('redis.host'),
        port: this.configService.get<number>('redis.port'),
        password: this.configService.get<string>('redis.password'),
        db: this.configService.get<number>('redis.db'),
        maxRetriesPerRequest: this.configService.get<number>('redis.maxRetriesPerRequest'),
        lazyConnect: this.configService.get<boolean>('redis.lazyConnect'),
      });

      this.client.on('connect', () => {
        this.logger.log('Redis 连接成功');
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis 连接错误:', error);
      });

      await this.client.connect();
    } catch (error) {
      this.logger.error('Redis 初始化失败:', error);
      throw error;
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
      this.logger.log('Redis 连接已断开');
    }
  }

  /**
   * 将 token 加入黑名单
   * @param token JWT token
   * @param expiresIn 过期时间（秒）
   */
  async blacklistToken(token: string, expiresIn: number): Promise<void> {
    const key = `${this.tokenBlacklistPrefix}${token}`;
    await this.client.setex(key, expiresIn, '1');
    this.logger.debug(`Token 已加入黑名单: ${key}`);
  }

  /**
   * 检查 token 是否在黑名单中
   * @param token JWT token
   * @returns 是否在黑名单中
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `${this.tokenBlacklistPrefix}${token}`;
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * 存储刷新 token
   * @param userId 用户ID
   * @param refreshToken 刷新token
   * @param expiresIn 过期时间（秒）
   */
  async storeRefreshToken(userId: number, refreshToken: string, expiresIn: number): Promise<void> {
    const key = `${this.refreshTokenPrefix}${userId}`;
    await this.client.setex(key, expiresIn, refreshToken);
    this.logger.debug(`刷新token已存储: ${key}`);
  }

  /**
   * 验证刷新 token
   * @param userId 用户ID
   * @param refreshToken 刷新token
   * @returns 是否有效
   */
  async validateRefreshToken(userId: number, refreshToken: string): Promise<boolean> {
    const key = `${this.refreshTokenPrefix}${userId}`;
    const storedToken = await this.client.get(key);
    return storedToken === refreshToken;
  }

  /**
   * 删除刷新 token
   * @param userId 用户ID
   */
  async removeRefreshToken(userId: number): Promise<void> {
    const key = `${this.refreshTokenPrefix}${userId}`;
    await this.client.del(key);
    this.logger.debug(`刷新token已删除: ${key}`);
  }

  /**
   * 存储用户会话信息
   * @param userId 用户ID
   * @param accessToken 访问token
   * @param expiresIn 过期时间（秒）
   */
  async storeUserSession(userId: number, accessToken: string, expiresIn: number): Promise<void> {
    const key = `${this.userSessionPrefix}${userId}`;
    await this.client.setex(key, expiresIn, accessToken);
    this.logger.debug(`用户会话已存储: ${key}`);
  }

  /**
   * 获取用户会话信息
   * @param userId 用户ID
   * @returns 访问token
   */
  async getUserSession(userId: number): Promise<string | null> {
    const key = `${this.userSessionPrefix}${userId}`;
    const accessToken: string | null = await this.client.get(key);
    return accessToken;
  }

  /**
   * 移除用户会话
   */
  async removeUserSession(userId: number): Promise<void> {
    const key = `${this.userSessionPrefix}${userId}`;
    await this.client.del(key);
    this.logger.debug(`用户会话已删除: ${key}`);
  }

  /**
   * 验证用户会话是否有效
   */
  async isUserSessionValid(userId: number, accessToken: string): Promise<boolean> {
    try {
      const key = `${this.userSessionPrefix}${userId}`;
      const storedToken = await this.client.get(key);
      return storedToken === accessToken;
    } catch (error) {
      this.logger.error('验证用户会话失败:', error);
      return false;
    }
  }

  /**
   * 清除用户所有相关数据（登出时使用）
   * @param userId 用户ID
   * @param accessToken 访问token
   * @param refreshToken 刷新token
   * @param accessTokenExpiresIn 访问token过期时间
   */
  async clearUserTokens(userId: number, accessToken: string, refreshToken?: string, accessTokenExpiresIn?: number): Promise<void> {
    const promises: Promise<any>[] = [];

    // 将访问token加入黑名单
    if (accessTokenExpiresIn) {
      promises.push(this.blacklistToken(accessToken, accessTokenExpiresIn));
    }

    // 将刷新token加入黑名单（如果提供）
    if (refreshToken) {
      // 刷新token通常有更长的过期时间，这里设置为30天
      promises.push(this.blacklistToken(refreshToken, 30 * 24 * 60 * 60));
    }

    // 删除存储的刷新token
    promises.push(this.removeRefreshToken(userId));

    // 删除用户会话
    promises.push(this.removeUserSession(userId));

    await Promise.all(promises);
    this.logger.debug(`用户 ${userId} 的所有token已清除`);
  }

  /**
   * 获取 Redis 客户端实例（用于其他复杂操作）
   */
  getClient(): Redis {
    return this.client;
  }
}
