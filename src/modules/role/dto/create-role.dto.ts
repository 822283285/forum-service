import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, MaxLength, Min } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: '管理员', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '角色代码', example: 'admin', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: '角色描述', example: '系统管理员，拥有所有权限', maxLength: 500, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: '角色状态', enum: ['active', 'inactive'], example: 'active', default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @ApiProperty({ description: '角色级别', example: 1, minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  level?: number;

  @ApiProperty({ description: '是否为系统内置角色', example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @ApiProperty({ description: '排序权重', example: 100, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort?: number;

  @ApiProperty({ description: '权限ID列表', example: [1, 2, 3], type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds?: number[];
}
