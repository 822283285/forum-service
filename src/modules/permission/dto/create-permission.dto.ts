import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, MaxLength, Min } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: '权限名称', example: '用户管理', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '权限代码', example: 'user:read', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  code: string;

  @ApiProperty({ description: '权限描述', example: '查看用户信息的权限', maxLength: 500, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: '所属模块', example: 'user', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  module: string;

  @ApiProperty({ description: '操作类型', example: 'read', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  action: string;

  @ApiProperty({ description: '资源路径', example: '/api/users', maxLength: 200, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  resource?: string;

  @ApiProperty({ description: '权限状态', enum: ['active', 'inactive'], example: 'active', default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @ApiProperty({ description: '权限级别', example: 1, minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  level?: number;

  @ApiProperty({ description: '是否为系统内置权限', example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @ApiProperty({ description: '排序权重', example: 100, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort?: number;

  @ApiProperty({ description: '父权限ID', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}
