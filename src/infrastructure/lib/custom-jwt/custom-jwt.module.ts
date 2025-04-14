
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CustomJwtService } from './custom-jwt.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('ACCESS_TOKEN_KEY'),
        signOptions: { expiresIn: configService.get('ACCESS_TOKEN_TIME') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CustomJwtService],
  exports: [CustomJwtService],
})
export class CustomJwtModule {}
