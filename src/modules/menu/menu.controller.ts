import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ResponseDto, PaginationDto } from '../../common/dto/response.dto';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, QueryMenuDto } from './dto';
import { Menu } from './entities/menu.entity';
import { DynamicPermission } from '../../common/decorators/dynamic-permission.decorator';
import { GetUser } from '../auth/decorators';
import { User } from '../user/entities/user.entity';
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
  @ApiResponse({ status: 201, description: '菜单创建成功', type: ResponseDto<Menu> })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '菜单路径已存在' })
  async create(@Body() createMenuDto: CreateMenuDto) {
    const menu = await this.menuService.create(createMenuDto);
    return ResponseDto.success(menu, '菜单创建成功');
  }

  @Get()
  @DynamicPermission({ code: 'menu:read' })
  @ApiOperation({ summary: '获取菜单列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto<PaginationDto<Menu>> })
  async findAll(@Query() queryDto: QueryMenuDto) {
    const { page = 1, limit = 10 } = queryDto;
    const result = await this.menuService.findAll(queryDto);
    const paginationData = new PaginationDto(result.data, result.total, page, limit);
    return ResponseDto.success(paginationData, '获取菜单列表成功');
  }

  @Get('tree')
  @DynamicPermission({ code: 'menu:read' })
  @ApiOperation({ summary: '获取菜单树' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto<Menu[]> })
  async getMenuTree() {
    const tree = await this.menuService.getMenuTree();
    return ResponseDto.success(tree, '获取菜单树成功');
  }

  @Get('user-tree')
  @ApiOperation({ summary: '获取用户菜单树' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto<Menu[]> })
  async getUserMenuTree(@GetUser() user: User) {
    const userPermissions = this.permissionService.getUserPermissions(user);
    const tree = await this.menuService.getUserMenuTree(userPermissions);
    return ResponseDto.success(tree, '获取用户菜单树成功');
  }

  @Get(':id')
  @DynamicPermission({ code: 'menu:read' })
  @ApiOperation({ summary: '根据ID获取菜单详情' })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'number' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResponseDto<Menu> })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const menu = await this.menuService.findOne(id);
    return ResponseDto.success(menu, '获取菜单详情成功');
  }

  @Patch(':id')
  @DynamicPermission({ code: 'menu:update' })
  @ApiOperation({ summary: '更新菜单' })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'number' })
  @ApiResponse({ status: 200, description: '更新成功', type: ResponseDto<Menu> })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  @ApiResponse({ status: 409, description: '菜单路径已存在' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateMenuDto: UpdateMenuDto) {
    const menu = await this.menuService.update(id, updateMenuDto);
    return ResponseDto.success(menu, '菜单更新成功');
  }

  @Delete(':id')
  @DynamicPermission({ code: 'menu:delete' })
  @ApiOperation({ summary: '删除菜单' })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功', type: ResponseDto<null> })
  @ApiResponse({ status: 400, description: '系统菜单不能删除或存在子菜单' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.menuService.remove(id);
    return ResponseDto.success(null, '菜单删除成功');
  }
}
