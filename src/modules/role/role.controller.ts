import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto, AssignRoleDto, RevokeRoleDto, RolePermissionDto } from './dto';
import { Role } from './entities/role.entity';
import { User } from '../user/entities/user.entity';
import { Permission } from '../permission/entities/permission.entity';

@ApiTags('角色管理')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @ApiResponse({ status: 201, description: '角色创建成功', type: Role })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '角色代码已存在' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return await this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: '获取角色列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Role] })
  async findAll(@Query() queryDto: QueryRoleDto) {
    return await this.roleService.findAll(queryDto);
  }

  @Get('active')
  @ApiOperation({ summary: '获取激活状态的角色列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Role] })
  async getActiveRoles(): Promise<Role[]> {
    return await this.roleService.getActiveRoles();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取角色详情' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '获取成功', type: Role })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    return await this.roleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新角色' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '更新成功', type: Role })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  @ApiResponse({ status: 409, description: '角色代码已存在' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto): Promise<Role> {
    return await this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除角色' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 400, description: '系统角色不能删除或角色下存在用户' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.roleService.remove(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据代码获取角色详情' })
  @ApiParam({ name: 'code', description: '角色代码', type: 'string' })
  @ApiResponse({ status: 200, description: '获取成功', type: Role })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async findByCode(@Param('code') code: string): Promise<Role> {
    return await this.roleService.findByCode(code);
  }

  @Post(':id/users/assign')
  @ApiOperation({ summary: '为用户分配角色' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '分配成功' })
  @ApiResponse({ status: 404, description: '角色或用户不存在' })
  async assignToUsers(@Param('id', ParseIntPipe) roleId: number, @Body() assignRoleDto: AssignRoleDto): Promise<void> {
    await this.roleService.assignRoleToUsers(roleId, assignRoleDto.userIds);
  }

  @Post(':id/users/revoke')
  @ApiOperation({ summary: '撤销用户角色' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '撤销成功' })
  @ApiResponse({ status: 404, description: '角色或用户不存在' })
  async revokeFromUsers(@Param('id', ParseIntPipe) roleId: number, @Body() revokeRoleDto: RevokeRoleDto): Promise<void> {
    await this.roleService.revokeRoleFromUsers(roleId, revokeRoleDto.userIds);
  }

  @Get(':id/users')
  @ApiOperation({ summary: '获取角色下的用户列表' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '获取成功', type: [User] })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async getRoleUsers(@Param('id', ParseIntPipe) id: number): Promise<User[]> {
    return await this.roleService.getRoleUsers(id);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: '设置角色权限' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '设置成功' })
  @ApiResponse({ status: 404, description: '角色或权限不存在' })
  async setRolePermissions(@Param('id', ParseIntPipe) roleId: number, @Body() rolePermissionDto: RolePermissionDto): Promise<void> {
    await this.roleService.setRolePermissions(roleId, rolePermissionDto.permissionIds);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: '获取角色权限列表' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Permission] })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async getRolePermissions(@Param('id', ParseIntPipe) id: number): Promise<Permission[]> {
    return await this.roleService.getRolePermissions(id);
  }
}
