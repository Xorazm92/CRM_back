import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt.module';


@Module({
  imports: [PrismaModule, CustomJwtModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
