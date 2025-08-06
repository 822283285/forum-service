import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 设置全局前缀
  app.setGlobalPrefix(configService.get<string>('app.globalPrefix') || 'api');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: configService.get<boolean>('app.validation.whitelist') ?? true,
      transform: configService.get<boolean>('app.validation.transform') ?? true,
      forbidNonWhitelisted:
        configService.get<boolean>('app.validation.forbidNonWhitelisted') ??
        true,
    }),
  );

  // 全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('app.swagger.title') || '论坛服务 API')
    .setDescription(
      configService.get<string>('app.swagger.description') ||
        '论坛服务后端 API 文档',
    )
    .setVersion(configService.get<string>('app.swagger.version') || '1.0')
    .addTag(
      configService.get<string>('app.swagger.tags.app') || '应用信息',
      '应用基本信息和状态',
    )
    .addTag(
      configService.get<string>('app.swagger.tags.user') || '用户管理',
      '用户相关操作',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(
    configService.get<string>('app.swagger.path') || 'swagger',
    app,
    document,
    {
      swaggerOptions: {
        persistAuthorization:
          configService.get<boolean>('app.swagger.persistAuthorization') ??
          true,
      },
    },
  );

  const port = configService.get<number>('app.port') || 3000;
  const swaggerPath =
    configService.get<string>('app.swagger.path') || 'swagger';

  await app.listen(port);
  console.log(`应用已启动，访问地址: http://localhost:${port}`);
  console.log(`Swagger 文档地址: http://localhost:${port}/${swaggerPath}`);
}
void bootstrap();
