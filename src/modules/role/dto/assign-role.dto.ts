import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ArrayNotEmpty } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ description: '用户ID列表', example: [1, 2, 3], type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  userIds: number[];

  @ApiProperty({ description: '角色ID列表', example: [1, 2, 3], type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  roleIds: number[];
}

export class RevokeRoleDto {
  @ApiProperty({ description: '用户ID列表', example: [1, 2, 3], type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  userIds: number[];

  @ApiProperty({ description: '角色ID列表', example: [1, 2, 3], type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  roleIds: number[];
}

export class RolePermissionDto {
  @ApiProperty({ description: '角色ID', example: 1 })
  @IsNumber()
  roleId: number;

  @ApiProperty({ description: '权限ID列表', example: [1, 2, 3], type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}
