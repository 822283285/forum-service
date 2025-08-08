import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsArray, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMenuDto {
  @ApiProperty({ description: '菜单名称', example: '用户管理', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '菜单标题', example: '用户管理', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  title: string;

  @ApiPropertyOptional({ description: '菜单图标', example: 'user', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({ description: '路由路径', example: '/users', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  path: string;

  @ApiPropertyOptional({ description: '组件路径', example: 'views/user/index.vue', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  component?: string;

  @ApiPropertyOptional({ description: '重定向路径', example: '/users/list', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  redirect?: string;

  @ApiProperty({ description: '菜单类型', enum: ['directory', 'menu', 'button'], example: 'menu' })
  @IsEnum(['directory', 'menu', 'button'])
  type: string;

  @ApiPropertyOptional({ description: '菜单状态', enum: ['active', 'inactive'], example: 'active', default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional({ description: '是否隐藏', example: false, default: false })
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @ApiPropertyOptional({ description: '是否缓存', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  keepAlive?: boolean;

  @ApiPropertyOptional({ description: '是否固定标签页', example: false, default: false })
  @IsOptional()
  @IsBoolean()
  affix?: boolean;

  @ApiPropertyOptional({ description: '排序权重', example: 100, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sort?: number;

  @ApiPropertyOptional({ description: '父菜单ID', example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number;

  @ApiPropertyOptional({ description: '外部链接', example: 'https://example.com', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  externalLink?: string;

  @ApiPropertyOptional({ description: '菜单描述', example: '用户管理相关功能', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: '关联权限ID数组', example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  permissionIds?: number[];
}
