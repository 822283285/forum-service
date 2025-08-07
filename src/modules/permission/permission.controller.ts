import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { CreatePermissionDto, UpdatePermissionDto, QueryPermissionDto } from './dto';
import { Permission } from './entities/permission.entity';

@ApiTags('权限管理')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: '创建权限' })
  @ApiResponse({ status: 201, description: '权限创建成功', type: Permission })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '权限代码已存在' })
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return await this.permissionService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: '获取权限列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Permission] })
  async findAll(@Query() queryDto: QueryPermissionDto) {
    return await this.permissionService.findAll(queryDto);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取权限树' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Permission] })
  async getPermissionTree(): Promise<Permission[]> {
    return await this.permissionService.getPermissionTree();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取权限详情' })
  @ApiParam({ name: 'id', description: '权限ID', type: 'number' })
  @ApiResponse({ status: 200, description: '获取成功', type: Permission })
  @ApiResponse({ status: 404, description: '权限不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Permission> {
    return await this.permissionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新权限' })
  @ApiParam({ name: 'id', description: '权限ID', type: 'number' })
  @ApiResponse({ status: 200, description: '更新成功', type: Permission })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '权限不存在' })
  @ApiResponse({ status: 409, description: '权限代码已存在' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    return await this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除权限' })
  @ApiParam({ name: 'id', description: '权限ID', type: 'number' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 400, description: '系统权限不能删除或存在子权限' })
  @ApiResponse({ status: 404, description: '权限不存在' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.permissionService.remove(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据代码获取权限详情' })
  @ApiParam({ name: 'code', description: '权限代码', type: 'string' })
  @ApiResponse({ status: 200, description: '获取成功', type: Permission })
  @ApiResponse({ status: 404, description: '权限不存在' })
  async findByCode(@Param('code') code: string): Promise<Permission> {
    return await this.permissionService.findByCode(code);
  }
}
