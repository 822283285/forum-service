import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...((configService.get('database') as Record<string, any>) || {}),
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
