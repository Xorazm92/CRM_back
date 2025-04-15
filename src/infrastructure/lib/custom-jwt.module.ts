import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomJwtService } from './custom-jwt.service';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CustomJwtService, JwtStrategy, PrismaService],
  exports: [CustomJwtService],
})
export class CustomJwtModule {}
