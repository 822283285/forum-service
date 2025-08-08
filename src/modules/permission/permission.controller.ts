import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ResponseDto, PaginationDto } from '../../common/dto/response.dto';
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
  @ApiResponse({ status: 201, description: '权限创建成功', type: ResponseDto<Permission> })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '权限代码已存在' })
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const permission = await this.permissionService.create(createPermissionDto);
    return ResponseDto.success(permission, '权限创建成功');
  }

  @Get()
  @ApiOperation({ summary: '获取权限列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto<PaginationDto<Permission>> })
  async findAll(@Query() queryDto: QueryPermissionDto) {
    const { page = 1, limit = 10 } = queryDto;
    const result = await this.permissionService.findAll(queryDto);
    const paginationData = new PaginationDto(result.data, result.total, page, limit);
    return ResponseDto.success(paginationData, '获取权限列表成功');
  }

  @Get('tree')
  @ApiOperation({ summary: '获取权限树' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto<Permission[]> })
  async getPermissionTree() {
    const tree = await this.permissionService.getPermissionTree();
    return ResponseDto.success(tree, '获取权限树成功');
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取权限详情' })
  @ApiParam({ name: 'id', description: '权限ID', type: 'number' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto<Permission> })
  @ApiResponse({ status: 404, description: '权限不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const permission = await this.permissionService.findOne(id);
    return ResponseDto.success(permission, '获取权限详情成功');
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新权限' })
  @ApiParam({ name: 'id', description: '权限ID', type: 'number' })
  @ApiResponse({ status: 200, description: '更新成功', type: ResponseDto<Permission> })
  @ApiResponse({ status: 404, description: '权限不存在' })
  @ApiResponse({ status: 409, description: '权限代码已存在' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionService.update(id, updatePermissionDto);
    return ResponseDto.success(permission, '权限更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除权限' })
  @ApiParam({ name: 'id', description: '权限ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功', type: ResponseDto<null> })
  @ApiResponse({ status: 404, description: '权限不存在' })
  @ApiResponse({ status: 400, description: '权限正在使用中，无法删除' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.permissionService.remove(id);
    return ResponseDto.success(null, '权限删除成功');
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
