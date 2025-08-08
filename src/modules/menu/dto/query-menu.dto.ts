import { IsOptional, IsString, IsEnum, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryMenuDto {
  @ApiPropertyOptional({ description: '页码', example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', example: 10, minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: '菜单名称（模糊搜索）', example: '用户' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '菜单标题（模糊搜索）', example: '用户管理' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '路由路径（模糊搜索）', example: '/users' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: '菜单类型', enum: ['directory', 'menu', 'button'], example: 'menu' })
  @IsOptional()
  @IsEnum(['directory', 'menu', 'button'])
  type?: string;

  @ApiPropertyOptional({ description: '菜单状态', enum: ['active', 'inactive'], example: 'active' })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional({ description: '是否隐藏', example: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hidden?: boolean;

  @ApiPropertyOptional({ description: '父菜单ID', example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number;

  @ApiPropertyOptional({ description: '是否为系统内置菜单', example: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isSystem?: boolean;
}
