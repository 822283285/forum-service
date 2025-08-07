import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}
  /**
   * 获取应用基本信息
   */
  getAppInfo() {
    return {
      name: this.configService.get<string>('app.name'),
      description: this.configService.get<string>('app.description'),
      author: this.configService.get<string>('app.author'),
      environment: this.configService.get<string>('app.env'),
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
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
      },
    };
  }

  /**
   * 获取版本信息
   */
  getVersion() {
    return {
      version: this.configService.get<string>('app.version'),
      apiVersion: 'v1',
      nodeVersion: process.version,
      buildTime: Date.now(),
    };
  }

  /**
   * 获取操作系统信息
   */
  getOsInfo() {
    return {
      os: process.platform,
      arch: process.arch,
      release: process.release,
    };
  }

  /**
   * 获取进程信息
   */
  getProcessInfo() {
    return {
      pid: process.pid,
      ppid: process.ppid,
      arch: process.arch,
      platform: process.platform,
      version: process.version,
      argv: process.argv,
      execPath: process.execPath,
      cwd: process.cwd(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      hrtime: process.hrtime(),
    };
  }

  /**
   * 获取详细的应用信息
   */
  getAppInfoDetail() {
    return {
      ...this.getVersion(),
      ...this.getHealth(),
      ...this.getOsInfo(),
      ...this.getProcessInfo(),
      ...this.getAppInfo(),
    };
  }
}
