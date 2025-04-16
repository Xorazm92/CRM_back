import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt.module';
import { JwtStrategy } from 'src/infrastructure/lib/jwt.strategy';

@Module({
  imports: [CustomJwtModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
