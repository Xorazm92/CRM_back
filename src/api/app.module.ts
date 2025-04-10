import { Module } from '@nestjs/common';
import { CustomLogger } from '../infrastructure/lib/custom-logger/logger.service';
import { WinstonModule } from 'nest-winston';
import { AdminModule } from './admin/admin.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { GroupModule } from './group/group.module';
import { AuthModule } from './auth/auth.module';
import { TeacherModule } from './teacher/teacher.module';
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt';
import { StudentModule } from './student/student.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CourseModule } from './course/course.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UserModule } from './user/user.module'; // Assuming this module exists
import { AttendanceModule } from './attendance/attendance.module'; // Assuming this module exists
import { AssignmentsModule } from './assignments/assignments.module'; // Assuming this module exists
import { SubmissionsModule } from './submissions/submissions.module'; // Assuming this module exists
import { FileuploadModule } from './fileupload/fileupload.module'; // Assuming this module exists
import { LessonModule } from './lesson/lesson.module'; // Assuming this module exists


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
    ]),
    AuthModule,
    WinstonModule.forRoot({}),
    CustomJwtModule,
    AdminModule,
    GroupModule,
    TeacherModule,
    StudentModule,
    CourseModule,
    DashboardModule,
    UserModule,
    AttendanceModule,
    AssignmentsModule,
    SubmissionsModule,
    FileuploadModule,
    LessonModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    CustomLogger,
  ],
  exports: [CustomLogger],
})
export class AppModule {}