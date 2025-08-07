import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryRoleDto {
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

  @ApiProperty({ description: '角色名称（模糊搜索）', example: '管理', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '角色代码（模糊搜索）', example: 'admin', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: '角色状态', enum: ['active', 'inactive'], required: false })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @ApiProperty({ description: '是否为系统角色', example: false, required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isSystem?: boolean;

  @ApiProperty({ description: '最小级别', example: 0, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  @Min(0)
  minLevel?: number;

  @ApiProperty({ description: '最大级别', example: 10, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  @Min(0)
  maxLevel?: number;
}
