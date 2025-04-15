import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt.module';


@Module({
  imports: [PrismaModule, CustomJwtModule], // Add CustomJwtModule here
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
