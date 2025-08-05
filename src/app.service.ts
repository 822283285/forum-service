import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * 获取应用基本信息
   */
  getAppInfo() {
    return {
      name: 'Forum Service',
      description: '论坛服务后端 API',
      author: 'Forum Team',
      environment: process.env.NODE_ENV || 'development',
      timestamp: Date.now(),
    };
  }

  /**
   * 健康检查
   */
  getHealth() {
    return {
      status: 'ok',
      message: '服务运行正常',
      timestamp: Date.now(),
      uptime: process.uptime(),
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
      },
    };
  }

  /**
   * 获取版本信息
   */
  getVersion() {
    return {
      version: '1.0.0',
      apiVersion: 'v1',
      nodeVersion: process.version,
      buildTime: Date.now(),
    };
  }
}
