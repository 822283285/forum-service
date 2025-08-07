import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserModule } from '../user/user.module';
import { CacheModule } from '../../core/cache/cache.module';

@Module({
  imports: [
    UserModule,
    CacheModule,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.security.jwtSecret') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('app.security.jwtExpiresIn') || '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
