import {
  IsNotEmpty,
  IsArray,
  IsInt,
  IsEnum,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class UpdateStatusDto {
  @IsNotEmpty({ message: '用户ID数组不能为空' })
  @IsArray({ message: '用户ID必须是数组' })
  @ArrayMinSize(1, { message: '至少需要选择一个用户' })
  @ArrayMaxSize(100, { message: '一次最多只能操作100个用户' })
  @IsInt({ each: true, message: '用户ID必须是整数' })
  ids: number[];

  @IsNotEmpty({ message: '状态不能为空' })
  @IsEnum(['active', 'inactive', 'banned'], {
    message: '状态只能是active、inactive或banned',
  })
  status: 'active' | 'inactive' | 'banned';
}
