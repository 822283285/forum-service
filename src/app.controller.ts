import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ResponseDto } from './common/dto/response.dto';

@ApiTags('应用信息')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '应用信息', description: '获取应用基本信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto })
  getAppInfo() {
    const appInfo = this.appService.getAppInfo();
    return ResponseDto.success(appInfo, '获取应用信息成功');
  }

  @Get('health')
  @ApiOperation({ summary: '健康检查', description: '检查应用运行状态' })
  @ApiResponse({ status: 200, description: '服务正常', type: ResponseDto })
  getHealth() {
    const health = this.appService.getHealth();
    return ResponseDto.success(health, '服务运行正常');
  }

  @Get('version')
  @ApiOperation({ summary: '版本信息', description: '获取应用版本信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto })
  getVersion() {
    const version = this.appService.getVersion();
    return ResponseDto.success(version, '获取版本信息成功');
  }
}
