import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt.module';

@Module({
  imports: [PrismaModule, CustomJwtModule],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
