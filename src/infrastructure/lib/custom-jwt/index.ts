import { Module } from '@nestjs/common';
import { CustomJwtService } from './custom-jwt.service';

@Module({
  providers: [CustomJwtService],
  exports: [CustomJwtService],
})
export class CustomJwtModule {}

export * from './custom-jwt.module';
export * from './custom-jwt.service';
