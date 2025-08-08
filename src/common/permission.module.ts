import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionService } from './services/permission.service';
import { PermissionGuard } from './guards/permission.guard';
import { Permission } from '../modules/permission/entities/permission.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [PermissionService, PermissionGuard],
  exports: [PermissionService, PermissionGuard],
})
export class PermissionModule {}
