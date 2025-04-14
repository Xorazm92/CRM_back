import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CustomJwtModule } from '../../infrastructure/lib/custom-jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    CustomJwtModule,
    ConfigModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy,
    ConfigService
  ],
  exports: [AuthService],
})
export class AuthModule {}