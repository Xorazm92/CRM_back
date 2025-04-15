import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt.module';

@Module({
  imports: [CustomJwtModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, PrismaService],
})
export class AttendanceModule {}