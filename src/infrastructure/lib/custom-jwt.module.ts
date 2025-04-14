import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CustomJwtService } from './custom-jwt.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [CustomJwtService],
  exports: [CustomJwtService],
})
export class CustomJwtModule {}
