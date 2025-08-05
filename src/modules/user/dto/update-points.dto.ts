import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class UpdatePointsDto {
  @IsNotEmpty({ message: '积分数量不能为空' })
  @IsInt({ message: '积分数量必须是整数' })
  @Min(-10000, { message: '积分数量不能小于-10000' })
  @Max(10000, { message: '积分数量不能大于10000' })
  points: number;

  @IsOptional()
  @IsString({ message: '积分变动原因必须是字符串' })
  @MaxLength(200, { message: '积分变动原因长度不能超过200个字符' })
  reason?: string;
}
