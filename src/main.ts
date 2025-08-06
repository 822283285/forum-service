import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import {
  createSwaggerConfig,
  getSwaggerOptions,
  getSwaggerPath,
} from './config/swagger.config';

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
  const config = createSwaggerConfig(configService);
  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = getSwaggerPath(configService);
  const swaggerOptions = getSwaggerOptions(configService);

  SwaggerModule.setup(swaggerPath, app, document, swaggerOptions);

  const port = configService.get<number>('app.port') || 3000;

  await app.listen(port);
  console.log(`应用已启动，访问地址: http://localhost:${port}`);
  console.log(`Swagger 文档地址: http://localhost:${port}/${swaggerPath}`);
}
void bootstrap();
