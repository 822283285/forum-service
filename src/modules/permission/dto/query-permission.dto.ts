import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryPermissionDto {
  @ApiProperty({ description: '页码', example: 1, minimum: 1, default: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', example: 10, minimum: 1, maximum: 100, default: 10, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ description: '权限名称（模糊搜索）', example: '用户', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '权限代码（模糊搜索）', example: 'user', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: '所属模块', example: 'user', required: false })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiProperty({ description: '操作类型', example: 'read', required: false })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({ description: '权限状态', enum: ['active', 'inactive'], required: false })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @ApiProperty({ description: '父权限ID', example: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  parentId?: number;

  @ApiProperty({ description: '是否为系统权限', example: false, required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isSystem?: boolean;
}
