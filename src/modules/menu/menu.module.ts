import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { Menu } from './entities/menu.entity';
import { Permission } from '../permission/entities/permission.entity';
import { PermissionModule } from '../../common/permission.module';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, Permission]), PermissionModule],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService, TypeOrmModule],
})
export class MenuModule {}
