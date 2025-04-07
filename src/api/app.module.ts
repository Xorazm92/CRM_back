import { Module } from '@nestjs/common';
import { CustomLogger } from '../infrastructure/lib/custom-logger/logger.service';
import { WinstonModule } from 'nest-winston';
import { AdminModule } from './admin/admin.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt';
import { ConfigModule } from '@nestjs/config';
import { GroupModule } from './group/group.module';

@Module({
  imports: [
    WinstonModule.forRoot({}),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CustomJwtModule,
    AdminModule,
    GroupModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    CustomLogger,
  ],
  exports: [CustomLogger],
})
export class AppModule {}
