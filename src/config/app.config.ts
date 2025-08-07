import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // 应用基本信息
  name: process.env.APP_NAME || '论坛服务',
  version: process.env.APP_VERSION || '1.0.0',
  description: process.env.APP_DESCRIPTION || '论坛服务后端 API',
  author: process.env.APP_AUTHOR || 'Forum Team',

  // 服务器配置
  port: parseInt(process.env.PORT || '3000', 10),
  globalPrefix: process.env.API_PREFIX || 'api',

  // 环境配置
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // 验证管道配置
  validation: {
    whitelist: process.env.VALIDATION_WHITELIST === 'true' || true,
    transform: process.env.VALIDATION_TRANSFORM === 'true' || true,
    forbidNonWhitelisted: process.env.VALIDATION_FORBID_NON_WHITELISTED === 'true' || true,
  },

  // 密码加密配置
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Swagger 配置
  swagger: {
    title: process.env.SWAGGER_TITLE || '论坛服务 API',
    description: process.env.SWAGGER_DESCRIPTION || '论坛服务后端 API 文档',
    version: process.env.SWAGGER_VERSION || '1.0',
    path: process.env.SWAGGER_PATH || 'swagger',
    persistAuthorization: process.env.SWAGGER_PERSIST_AUTH === 'true' || true,
    tags: {
      app: process.env.SWAGGER_TAG_APP || '应用信息',
      user: process.env.SWAGGER_TAG_USER || '用户管理',
    },
  },

  // CORS 配置
  cors: {
    enabled: process.env.CORS_ENABLED === 'true' || true,
    origin: process.env.CORS_ORIGIN || '*',
    methods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: process.env.CORS_CREDENTIALS === 'true' || false,
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: process.env.LOG_ENABLE_CONSOLE === 'true' || true,
    enableFile: process.env.LOG_ENABLE_FILE === 'true' || false,
    filePath: process.env.LOG_FILE_PATH || './logs',
  },
}));
