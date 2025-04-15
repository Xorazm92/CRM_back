import { Module } from '@nestjs/common';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt.module';


@Module({
  imports: [PrismaModule, CustomJwtModule],
  controllers: [LessonController],
  providers: [LessonService, PrismaService],
})
export class LessonModule {}
