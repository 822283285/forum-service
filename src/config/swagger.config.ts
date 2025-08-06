import { DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

/**
 * 创建 Swagger 文档配置
 * @param configService 配置服务
 * @returns Swagger 文档配置
 */
export function createSwaggerConfig(configService: ConfigService) {
  return new DocumentBuilder()
    .setTitle(configService.get<string>('app.swagger.title') || '论坛服务 API')
    .setDescription(configService.get<string>('app.swagger.description') || '论坛服务后端 API 文档')
    .setVersion(configService.get<string>('app.swagger.version') || '1.0')
    .addTag(configService.get<string>('app.swagger.tags.app') || '应用信息', '应用基本信息和状态')
    .addTag(configService.get<string>('app.swagger.tags.user') || '用户管理', '用户相关操作')
    .build();
}

/**
 * 获取 Swagger 设置选项
 * @param configService 配置服务
 * @returns Swagger 设置选项
 */
export function getSwaggerOptions(configService: ConfigService) {
  return {
    swaggerOptions: {
      persistAuthorization: configService.get<boolean>('app.swagger.persistAuthorization') ?? true,
    },
  };
}

/**
 * 获取 Swagger 路径
 * @param configService 配置服务
 * @returns Swagger 路径
 */
export function getSwaggerPath(configService: ConfigService): string {
  return configService.get<string>('app.swagger.path') || 'swagger';
}
