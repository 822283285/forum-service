import { Controller, Post, Body, HttpCode, HttpStatus, Req, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ResponseDto } from '../../common/dto/response.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto, TokenResponseDto } from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';

@ApiTags('认证管理')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户注册
   */
  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册', description: '用户注册接口' })
  @ApiResponse({
    status: 201,
    description: '注册成功',
    type: ResponseDto<TokenResponseDto>,
  })
  @ApiResponse({ status: 409, description: '用户名、邮箱或手机号已存在' })
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    const registerIp = req.ip || req.socket.remoteAddress;
    const result = await this.authService.register(registerDto, registerIp);
    return ResponseDto.success(result, '注册成功');
  }

  /**
   * 用户登录
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录', description: '用户登录验证接口' })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    type: ResponseDto<TokenResponseDto>,
  })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const loginIp = req.ip || req.socket.remoteAddress;
    const result = await this.authService.login(loginDto, loginIp);
    return ResponseDto.success(result, '登录成功');
  }

  /**
   * 刷新令牌
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新令牌', description: '使用刷新令牌获取新的访问令牌' })
  @ApiResponse({
    status: 200,
    description: '刷新成功',
    type: ResponseDto<TokenResponseDto>,
  })
  @ApiResponse({ status: 401, description: '无效的刷新令牌' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
    return ResponseDto.success(result, '令牌刷新成功');
  }

  /**
   * 获取当前用户信息
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息', description: '获取当前登录用户的详细信息' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: ResponseDto<User>,
  })
  @ApiResponse({ status: 401, description: '未授权' })
  getProfile(@Req() req: Request & { user: User }) {
    return ResponseDto.success(req.user, '获取用户信息成功');
  }

  /**
   * 用户登出
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户登出', description: '用户登出接口' })
  @ApiResponse({ status: 200, description: '登出成功', type: ResponseDto })
  @ApiResponse({ status: 401, description: '未授权' })
  async logout(@Req() req: Request & { user: User }, @Body() body?: { refreshToken?: string }) {
    // 从请求头获取访问token
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.replace('Bearer ', '') || '';

    // 调用服务层的登出方法
    await this.authService.logout(req.user.id, accessToken, body?.refreshToken);

    return ResponseDto.success(null, '登出成功');
  }
}
