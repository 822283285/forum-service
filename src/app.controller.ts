import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('应用信息')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: '获取应用信息',
    description: '获取论坛服务应用基本信息',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  getAppInfo() {
    return this.appService.getAppInfo();
  }

  @Get('health')
  @ApiOperation({ summary: '健康检查', description: '检查应用服务状态' })
  @ApiResponse({ status: 200, description: '服务正常' })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('version')
  @ApiOperation({ summary: '获取版本信息', description: '获取应用版本信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getVersion() {
    return this.appService.getVersion();
  }
}
