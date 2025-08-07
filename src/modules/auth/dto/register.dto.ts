import { IsNotEmpty, IsString, IsEmail, IsOptional, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: '用户名',
    example: 'john_doe123',
    minLength: 3,
    maxLength: 30,
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @Length(3, 30, { message: '用户名长度必须在3-30个字符之间' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '用户名只能包含字母、数字和下划线' })
  username: string;

  @ApiProperty({
    description: '邮箱',
    example: 'john@example.com',
  })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({
    description: '密码',
    example: 'Password123',
    minLength: 6,
    maxLength: 100,
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 100, { message: '密码长度必须在6-100个字符之间' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, {
    message: '密码必须包含至少一个大写字母、一个小写字母和一个数字',
  })
  password: string;

  @ApiPropertyOptional({
    description: '昵称',
    example: 'John Doe',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  @Length(1, 50, { message: '昵称长度必须在1-50个字符之间' })
  nickname?: string;

  @ApiPropertyOptional({
    description: '手机号',
    example: '13800138000',
  })
  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;
}
