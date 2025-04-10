import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt';

@Module({
  imports: [PrismaModule, CustomJwtModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
