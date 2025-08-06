import { IsNotEmpty, IsString, IsOptional, IsInt, Min, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchUserDto {
  @ApiProperty({
    description: '搜索关键词，可搜索用户名、昵称、邮箱等',
    example: 'john',
    minLength: 1,
    maxLength: 50,
  })
  @IsNotEmpty({ message: '搜索关键词不能为空' })
  @IsString({ message: '搜索关键词必须是字符串' })
  @Length(1, 50, { message: '搜索关键词长度必须在1-50个字符之间' })
  keyword: string;

  @ApiProperty({
    description: '页码',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于0' })
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    minimum: 1,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于0' })
  limit?: number = 10;
}
