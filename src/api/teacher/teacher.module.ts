import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  controllers: [TeacherController],
  providers: [TeacherService , PrismaService],
})
export class TeacherModule {}
