import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePointsDto {
  @ApiProperty({
    description: '积分变动数量，正数为增加，负数为减少',
    example: 100,
    minimum: -10000,
    maximum: 10000,
  })
  @IsNotEmpty({ message: '积分数量不能为空' })
  @IsInt({ message: '积分数量必须是整数' })
  @Min(-10000, { message: '积分数量不能小于-10000' })
  @Max(10000, { message: '积分数量不能大于10000' })
  points: number;

  @ApiProperty({
    description: '积分变动原因',
    example: '发布优质内容奖励',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '积分变动原因必须是字符串' })
  @MaxLength(200, { message: '积分变动原因长度不能超过200个字符' })
  reason?: string;
}
