import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { ResponseDto, PaginationDto } from '../../common/dto/response.dto';
import { DynamicPermission } from '../../common/decorators/dynamic-permission.decorator';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto, SearchUserDto, UpdatePointsDto, UpdateStatusDto } from './dto/index';
import { User } from './entities/user.entity';

@ApiTags('用户管理')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 创建用户（管理员创建）
   */
  @Post()
  @DynamicPermission({ code: 'user:create' })
  @ApiOperation({
    summary: '创建用户',
    description: '管理员创建用户接口，需要user:create权限',
  })
  @ApiResponse({
    status: 201,
    description: '用户创建成功',
    type: ResponseDto<User>,
    example: {
      code: 200,
      message: '用户创建成功',
      data: {
        id: 1,
        username: 'john_doe',
        email: 'john@example.com',
        status: 'active',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '请求参数验证失败',
    example: {
      code: 400,
      message: '参数验证失败: 用户名长度必须在3-50个字符之间',
    },
  })
  @ApiResponse({
    status: 409,
    description: '用户名或邮箱已存在',
    example: {
      code: 409,
      message: '用户名已存在，请选择其他用户名',
    },
  })
  @ApiResponse({
    status: 403,
    description: '权限不足',
    example: {
      code: 403,
      message: '权限不足，需要user:create权限',
    },
  })
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    const registerIp = req.ip || req.socket.remoteAddress;
    const user = await this.userService.create(createUserDto, registerIp);
    return ResponseDto.success(user, '用户创建成功');
  }

  /**
   * 获取用户列表
   */
  @Get()
  @DynamicPermission({ code: 'user:read' })
  @ApiOperation({
    summary: '获取用户列表',
    description: '分页获取用户列表，支持状态筛选，需要user:read权限',
  })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'status', required: false, description: '用户状态', enum: ['active', 'inactive', 'banned'] })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: ResponseDto<PaginationDto<User>>,
    example: {
      code: 200,
      message: '获取成功',
      data: {
        items: [
          {
            id: 1,
            username: 'john_doe',
            email: 'john@example.com',
            status: 'active',
          },
        ],
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '权限不足',
    example: {
      code: 403,
      message: '权限不足，需要user:read权限',
    },
  })
  async findAll(@Query() queryUserDto: QueryUserDto) {
    const { page = 1, limit = 10, status } = queryUserDto;
    const result = await this.userService.findAll(page, limit, status);
    const paginationData = new PaginationDto(result.users, result.total, page, limit);
    return ResponseDto.success(paginationData, '获取用户列表成功');
  }

  /**
   * 搜索用户
   */
  @Get('search')
  @DynamicPermission({ code: 'user:read' })
  @ApiOperation({ summary: '搜索用户', description: '根据关键词搜索用户' })
  @ApiResponse({
    status: 200,
    description: '搜索成功',
    type: ResponseDto<PaginationDto<User>>,
  })
  async searchUsers(@Query() searchUserDto: SearchUserDto) {
    const { keyword, page = 1, limit = 10 } = searchUserDto;
    const result = await this.userService.searchUsers(keyword, page, limit);
    const paginationData = new PaginationDto(result.users, result.total, page, limit);
    return ResponseDto.success(paginationData, '搜索用户成功');
  }

  /**
   * 获取活跃用户列表
   */
  @Get('active')
  @DynamicPermission({ code: 'user:read' })
  @ApiOperation({ summary: '获取活跃用户', description: '获取活跃用户列表' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '数量限制',
    example: 10,
  })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto })
  async getActiveUsers(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const users = await this.userService.getActiveUsers(limitNum);
    return ResponseDto.success(users, '获取活跃用户成功');
  }

  /**
   * 获取用户统计信息
   */
  @Get('stats')
  @DynamicPermission({ code: 'user:read' })
  @ApiOperation({ summary: '获取用户统计', description: '获取用户统计信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto })
  async getUserStats() {
    const stats = await this.userService.getUserStats();
    return ResponseDto.success(stats, '获取用户统计成功');
  }

  /**
   * 根据ID获取用户详情
   */
  @Get(':id')
  @DynamicPermission({ code: 'user:read' })
  @ApiOperation({ summary: '获取用户详情', description: '根据ID获取用户详情' })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOne(id);
    return ResponseDto.success(user, '获取用户详情成功');
  }

  /**
   * 更新用户信息
   */
  @Patch(':id')
  @DynamicPermission({ code: 'user:update' })
  @ApiOperation({ summary: '更新用户信息', description: '更新用户信息' })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiResponse({ status: 200, description: '更新成功', type: ResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    return ResponseDto.success(user, '用户信息更新成功');
  }

  /**
   * 更新用户状态
   */
  @Patch(':id/status')
  @DynamicPermission({ code: 'user:update' })
  @ApiOperation({ summary: '更新用户状态', description: '更新单个用户状态' })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiResponse({ status: 200, description: '状态更新成功', type: ResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() body: { status: 'active' | 'inactive' | 'banned' }) {
    const user = await this.userService.updateStatus(id, body.status);
    return ResponseDto.success(user, '用户状态更新成功');
  }

  /**
   * 批量更新用户状态
   */
  @Patch('batch/status')
  @DynamicPermission({ code: 'user:manage' })
  @ApiOperation({
    summary: '批量更新用户状态',
    description: '批量更新多个用户状态',
  })
  @ApiResponse({ status: 200, description: '批量更新成功', type: ResponseDto })
  async batchUpdateStatus(@Body() updateStatusDto: UpdateStatusDto) {
    const { ids, status } = updateStatusDto;
    await this.userService.batchUpdateStatus(ids, status);
    return ResponseDto.success(null, '批量更新状态成功');
  }

  /**
   * 更新用户积分
   */
  @Patch(':id/points')
  @DynamicPermission({ code: 'user:update' })
  @ApiOperation({ summary: '更新用户积分', description: '增加或扣除用户积分' })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiResponse({ status: 200, description: '积分更新成功', type: ResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async updatePoints(@Param('id', ParseIntPipe) id: number, @Body() updatePointsDto: UpdatePointsDto) {
    const { points } = updatePointsDto;

    let user;
    if (points > 0) {
      user = await this.userService.addPoints(id, points);
    } else {
      user = await this.userService.deductPoints(id, Math.abs(points));
    }
    return ResponseDto.success(user, '用户积分更新成功');
  }

  /**
   * 软删除用户
   */
  @Delete(':id')
  @DynamicPermission({ code: 'user:delete' })
  @ApiOperation({ summary: '删除用户', description: '软删除用户' })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiResponse({ status: 200, description: '删除成功', type: ResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(id);
    return ResponseDto.success(null, '用户删除成功');
  }

  /**
   * 检查用户是否存在
   */
  @Get('check/username/:username')
  @ApiOperation({ summary: '检查用户名', description: '检查用户名是否已存在' })
  @ApiParam({ name: 'username', description: '用户名', example: 'testuser' })
  @ApiResponse({ status: 200, description: '检查完成', type: ResponseDto })
  async checkUsername(@Param('username') username: string) {
    const exists = await this.userService.exists({ username });
    const data = { exists };
    const message = exists ? '用户名已存在' : '用户名可用';
    return ResponseDto.success(data, message);
  }

  /**
   * 检查邮箱是否存在
   */
  @Get('check/email/:email')
  @ApiOperation({ summary: '检查邮箱', description: '检查邮箱是否已存在' })
  @ApiParam({ name: 'email', description: '邮箱', example: 'test@example.com' })
  @ApiResponse({ status: 200, description: '检查完成', type: ResponseDto })
  async checkEmail(@Param('email') email: string) {
    const exists = await this.userService.exists({ email });
    const data = { exists };
    const message = exists ? '邮箱已存在' : '邮箱可用';
    return ResponseDto.success(data, message);
  }

  /**
   * 检查手机号是否存在
   */
  @Get('check/phone/:phone')
  @ApiOperation({ summary: '检查手机号', description: '检查手机号是否已存在' })
  @ApiParam({ name: 'phone', description: '手机号', example: '13800138000' })
  @ApiResponse({ status: 200, description: '检查完成', type: ResponseDto })
  async checkPhone(@Param('phone') phone: string) {
    const exists = await this.userService.exists({ phone });
    const data = { exists };
    const message = exists ? '手机号已存在' : '手机号可用';
    return ResponseDto.success(data, message);
  }
}
