import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, QueryMenuDto } from './dto';
import { Menu } from './entities/menu.entity';
import { DynamicPermission } from '../../common/decorators/dynamic-permission.decorator';
import { User } from '../user/entities/user.entity';
import { GetUser } from '../auth/decorators';
import { PermissionService } from '../../common/services/permission.service';

@ApiTags('菜单管理')
@ApiBearerAuth()
@Controller('menus')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly permissionService: PermissionService,
  ) {}

  @Post()
  @DynamicPermission({ code: 'menu:create' })
  @ApiOperation({ summary: '创建菜单' })
  @ApiResponse({ status: 201, description: '菜单创建成功', type: Menu })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '菜单路径已存在' })
  async create(@Body() createMenuDto: CreateMenuDto): Promise<Menu> {
    return await this.menuService.create(createMenuDto);
  }

  @Get()
  @DynamicPermission({ code: 'menu:read' })
  @ApiOperation({ summary: '获取菜单列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Menu] })
  async findAll(@Query() queryDto: QueryMenuDto): Promise<{ data: Menu[]; total: number }> {
    return await this.menuService.findAll(queryDto);
  }

  @Get('tree')
  @DynamicPermission({ code: 'menu:read' })
  @ApiOperation({ summary: '获取菜单树' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Menu] })
  async getMenuTree(): Promise<Menu[]> {
    return await this.menuService.getMenuTree();
  }

  @Get('user-tree')
  @ApiOperation({ summary: '获取用户菜单树' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Menu] })
  async getUserMenuTree(@GetUser() user: User): Promise<Menu[]> {
    const userPermissions = this.permissionService.getUserPermissions(user);
    return await this.menuService.getUserMenuTree(userPermissions);
  }

  @Get(':id')
  @DynamicPermission({ code: 'menu:read' })
  @ApiOperation({ summary: '根据ID获取菜单详情' })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'number' })
  @ApiResponse({ status: 200, description: '获取成功', type: Menu })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Menu> {
    return await this.menuService.findOne(id);
  }

  @Patch(':id')
  @DynamicPermission({ code: 'menu:update' })
  @ApiOperation({ summary: '更新菜单' })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'number' })
  @ApiResponse({ status: 200, description: '更新成功', type: Menu })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  @ApiResponse({ status: 409, description: '菜单路径已存在' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateMenuDto: UpdateMenuDto): Promise<Menu> {
    return await this.menuService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @DynamicPermission({ code: 'menu:delete' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除菜单' })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'number' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 400, description: '系统菜单不能删除或存在子菜单' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.menuService.remove(id);
  }
}
