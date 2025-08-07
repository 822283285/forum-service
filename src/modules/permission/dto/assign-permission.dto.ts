import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ArrayNotEmpty } from 'class-validator';

export class AssignPermissionDto {
  @ApiProperty({ description: '角色ID', example: 1 })
  @IsNumber()
  roleId: number;

  @ApiProperty({ description: '权限ID列表', example: [1, 2, 3], type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}

export class RevokePermissionDto {
  @ApiProperty({ description: '角色ID', example: 1 })
  @IsNumber()
  roleId: number;

  @ApiProperty({ description: '权限ID列表', example: [1, 2, 3], type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}
