import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CustomJwtService } from './custom-jwt.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_KEY,
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_TIME },
    }),
  ],
  providers: [CustomJwtService],
  exports: [CustomJwtService, JwtModule],
})
export class CustomJwtModule {} 