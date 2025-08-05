import {
  IsNotEmpty,
  IsArray,
  IsInt,
  IsEnum,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({
    description: '要更新状态的用户ID数组',
    example: [1, 2, 3],
    type: [Number],
    minItems: 1,
    maxItems: 100,
  })
  @IsNotEmpty({ message: '用户ID数组不能为空' })
  @IsArray({ message: '用户ID必须是数组' })
  @ArrayMinSize(1, { message: '至少需要选择一个用户' })
  @ArrayMaxSize(100, { message: '一次最多只能操作100个用户' })
  @IsInt({ each: true, message: '用户ID必须是整数' })
  ids: number[];

  @ApiProperty({
    description: '要设置的用户状态',
    enum: ['active', 'inactive', 'banned'],
    example: 'active',
  })
  @IsNotEmpty({ message: '状态不能为空' })
  @IsEnum(['active', 'inactive', 'banned'], {
    message: '状态只能是active、inactive或banned',
  })
  status: 'active' | 'inactive' | 'banned';
}
