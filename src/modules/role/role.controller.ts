import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ResponseDto, PaginationDto } from '../../common/dto/response.dto';
import { DynamicPermission } from '../../common/decorators/dynamic-permission.decorator';
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
  @ApiResponse({ status: 201, description: '角色创建成功', type: ResponseDto<Role> })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '角色代码已存在' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.roleService.create(createRoleDto);
    return ResponseDto.success(role, '角色创建成功');
  }

  @Get()
  @DynamicPermission({ code: 'role:read' })
  @ApiOperation({ summary: '获取角色列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto<PaginationDto<Role>> })
  async findAll(@Query() queryDto: QueryRoleDto) {
    const { page = 1, limit = 10 } = queryDto;
    const result = await this.roleService.findAll(queryDto);
    const paginationData = new PaginationDto(result.data, result.total, page, limit);
    return ResponseDto.success(paginationData, '获取角色列表成功');
  }

  @Get('active')
  @ApiOperation({ summary: '获取激活状态的角色列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto<Role[]> })
  async getActiveRoles() {
    const roles = await this.roleService.getActiveRoles();
    return ResponseDto.success(roles, '获取激活角色列表成功');
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取角色详情' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto<Role> })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const role = await this.roleService.findOne(id);
    return ResponseDto.success(role, '获取角色详情成功');
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新角色' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '更新成功', type: ResponseDto<Role> })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  @ApiResponse({ status: 409, description: '角色代码已存在' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    const role = await this.roleService.update(id, updateRoleDto);
    return ResponseDto.success(role, '角色更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功', type: ResponseDto<null> })
  @ApiResponse({ status: 400, description: '系统角色不能删除或角色下存在用户' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.roleService.remove(id);
    return ResponseDto.success(null, '角色删除成功');
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据代码获取角色详情' })
  @ApiParam({ name: 'code', description: '角色代码', type: 'string' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto<Role> })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async findByCode(@Param('code') code: string) {
    const role = await this.roleService.findByCode(code);
    return ResponseDto.success(role, '获取角色详情成功');
  }

  @Post(':id/users/assign')
  @ApiOperation({ summary: '为用户分配角色' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '分配成功', type: ResponseDto<null> })
  @ApiResponse({ status: 404, description: '角色或用户不存在' })
  async assignToUsers(@Param('id', ParseIntPipe) roleId: number, @Body() assignRoleDto: AssignRoleDto) {
    await this.roleService.assignRoleToUsers(roleId, assignRoleDto.userIds);
    return ResponseDto.success(null, '角色分配成功');
  }

  @Post(':id/users/revoke')
  @ApiOperation({ summary: '撤销用户角色' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '撤销成功', type: ResponseDto<null> })
  @ApiResponse({ status: 404, description: '角色或用户不存在' })
  async revokeFromUsers(@Param('id', ParseIntPipe) roleId: number, @Body() revokeRoleDto: RevokeRoleDto) {
    await this.roleService.revokeRoleFromUsers(roleId, revokeRoleDto.userIds);
    return ResponseDto.success(null, '角色撤销成功');
  }

  @Get(':id/users')
  @ApiOperation({ summary: '获取角色下的用户列表' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto<User[]> })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async getRoleUsers(@Param('id', ParseIntPipe) id: number) {
    const users = await this.roleService.getRoleUsers(id);
    return ResponseDto.success(users, '获取角色用户列表成功');
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: '设置角色权限' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '设置成功', type: ResponseDto<null> })
  @ApiResponse({ status: 404, description: '角色或权限不存在' })
  async setRolePermissions(@Param('id', ParseIntPipe) roleId: number, @Body() rolePermissionDto: RolePermissionDto) {
    await this.roleService.setRolePermissions(roleId, rolePermissionDto.permissionIds);
    return ResponseDto.success(null, '角色权限设置成功');
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: '获取角色权限列表' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto<Permission[]> })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async getRolePermissions(@Param('id', ParseIntPipe) id: number) {
    const permissions = await this.roleService.getRolePermissions(id);
    return ResponseDto.success(permissions, '获取角色权限列表成功');
  }
}
