import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './core/database/database.module';
import { CacheModule } from './core/cache/cache.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule as PermissionEntityModule } from './modules/permission/permission.module';
import { PermissionModule as GlobalPermissionModule } from './common/permission.module';
import { DynamicPermissionGuard } from './common/guards/dynamic-permission.guard';
import { PermissionInterceptor } from './common/interceptors/permission.interceptor';
import { PermissionMiddleware } from './common/middleware/permission.middleware';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import redisConfig from './config/redis.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.production'],
      load: [databaseConfig, appConfig, redisConfig],
    }),
    DatabaseModule,
    CacheModule,
    GlobalPermissionModule, // 全局权限模块
    UserModule,
    AuthModule,
    RoleModule,
    PermissionEntityModule, // 权限实体模块
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局JWT认证守卫 - 必须在权限守卫之前
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 全局权限守卫
    {
      provide: APP_GUARD,
      useClass: DynamicPermissionGuard,
    },
    // 全局权限拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: PermissionInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用权限中间件到所有路由
    consumer.apply(PermissionMiddleware).forRoutes('*path');
  }
}
