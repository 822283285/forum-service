import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  @Length(3, 50, { message: '用户名长度必须在3-50个字符之间' })
  @Matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, {
    message: '用户名只能包含字母、数字、下划线和中文字符',
  })
  username?: string;

  @IsOptional()
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 100, { message: '密码长度必须在6-100个字符之间' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, {
    message: '密码必须包含至少一个大写字母、一个小写字母和一个数字',
  })
  password?: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  @MaxLength(100, { message: '昵称长度不能超过100个字符' })
  nickname?: string;

  @IsOptional()
  @IsEnum(['男', '女', '保密'], { message: '性别只能是男、女或保密' })
  sex?: '男' | '女' | '保密';

  @IsOptional()
  @IsDateString({}, { message: '生日格式不正确，请使用YYYY-MM-DD格式' })
  birth?: string;

  @IsOptional()
  @IsString({ message: '签名必须是字符串' })
  @MaxLength(500, { message: '签名长度不能超过500个字符' })
  signature?: string;

  @IsOptional()
  @IsString({ message: '头像必须是字符串' })
  @MaxLength(255, { message: '头像URL长度不能超过255个字符' })
  avatar?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'banned'], {
    message: '状态只能是active、inactive或banned',
  })
  status?: 'active' | 'inactive' | 'banned';
}
