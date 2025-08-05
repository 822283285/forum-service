import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '用户名、邮箱或手机号',
    example: 'john_doe123',
    minLength: 1,
    maxLength: 100,
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @Length(1, 100, { message: '用户名长度必须在1-100个字符之间' })
  username: string; // 可以是用户名、邮箱或手机号

  @ApiProperty({
    description: '密码',
    example: 'Password123',
    minLength: 1,
    maxLength: 100,
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @Length(1, 100, { message: '密码长度必须在1-100个字符之间' })
  password: string;
}
