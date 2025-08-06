import { IsEmail, IsString, IsOptional, IsEnum, IsDateString, Length, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: '用户名，可包含字母、数字、下划线和中文字符',
    example: 'john_doe123',
    minLength: 3,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  @Length(3, 50, { message: '用户名长度必须在3-50个字符之间' })
  @Matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, {
    message: '用户名只能包含字母、数字、下划线和中文字符',
  })
  username?: string;

  @ApiProperty({
    description: '新密码，必须包含至少一个大写字母、一个小写字母和一个数字',
    example: 'NewPassword123',
    minLength: 6,
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 100, { message: '密码长度必须在6-100个字符之间' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, {
    message: '密码必须包含至少一个大写字母、一个小写字母和一个数字',
  })
  password?: string;

  @ApiProperty({
    description: '邮箱地址',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiProperty({
    description: '手机号码',
    example: '13812345678',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiProperty({
    description: '用户昵称',
    example: 'John Doe',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  @MaxLength(100, { message: '昵称长度不能超过100个字符' })
  nickname?: string;

  @ApiProperty({
    description: '性别',
    enum: ['男', '女', '保密'],
    example: '男',
    required: false,
  })
  @IsOptional()
  @IsEnum(['男', '女', '保密'], { message: '性别只能是男、女或保密' })
  sex?: '男' | '女' | '保密';

  @ApiProperty({
    description: '生日，格式为YYYY-MM-DD',
    example: '1990-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '生日格式不正确，请使用YYYY-MM-DD格式' })
  birth?: string;

  @ApiProperty({
    description: '个人签名',
    example: '这是我的个人签名',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '签名必须是字符串' })
  @MaxLength(500, { message: '签名长度不能超过500个字符' })
  signature?: string;

  @ApiProperty({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '头像必须是字符串' })
  @MaxLength(255, { message: '头像URL长度不能超过255个字符' })
  avatar?: string;

  @ApiProperty({
    description: '用户状态',
    enum: ['active', 'inactive', 'banned'],
    example: 'active',
    required: false,
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'banned'], {
    message: '状态只能是active、inactive或banned',
  })
  status?: 'active' | 'inactive' | 'banned';
}
