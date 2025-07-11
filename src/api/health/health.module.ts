import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { SecurityModule } from 'src/common/security/security.module';

@Module({
  imports: [SecurityModule],
  controllers: [HealthController],
  providers: [HealthService, PrismaService],
  exports: [HealthService],
})
export class HealthModule {}
