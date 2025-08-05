import { IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryUserDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于0' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于0' })
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'banned'], {
    message: '状态只能是active、inactive或banned',
  })
  status?: 'active' | 'inactive' | 'banned';
}
