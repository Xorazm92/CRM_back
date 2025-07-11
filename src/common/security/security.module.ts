import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AllExceptionsFilter } from '../exceptions/all-exceptions.filter';
import { SecurityService } from './security.service';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: parseInt(configService.get<string>('RATE_LIMIT_TTL', '60')),
        limit: parseInt(configService.get<string>('RATE_LIMIT_LIMIT', '100')),
      }),
    }),
  ],
  providers: [
    SecurityService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [SecurityService],
})
export class SecurityModule {}
