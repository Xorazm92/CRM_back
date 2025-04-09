import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  controllers: [StudentController],
  providers: [StudentService , PrismaService],
})
export class StudentModule {}
