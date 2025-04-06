import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  imports: [CustomJwtModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
})
export class AdminModule {}
