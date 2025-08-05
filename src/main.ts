import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 设置全局前缀
  app.setGlobalPrefix('api');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('论坛服务 API')
    .setDescription('论坛服务后端 API 文档')
    .setVersion('1.0')
    .addTag('应用信息', '应用基本信息和状态')
    .addTag('用户管理', '用户相关操作')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `应用已启动，访问地址: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `Swagger 文档地址: http://localhost:${process.env.PORT ?? 3000}/swagger`,
  );
}
void bootstrap();
