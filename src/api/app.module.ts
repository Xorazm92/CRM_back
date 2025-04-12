import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { TeacherModule } from './teacher/teacher.module';
import { StudentModule } from './student/student.module';
import { CourseModule } from './course/course.module';
import { GroupModule } from './group/group.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LessonModule } from './lesson/lesson.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { PaymentModule } from './payment/payment.module';
import { FileUploadModule } from './fileupload/fileupload.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60000
    }),
    AuthModule,
    UserModule,
    AdminModule,
    TeacherModule,
    StudentModule,
    CourseModule,
    GroupModule,
    DashboardModule,
    LessonModule,
    AttendanceModule,
    AssignmentsModule,
    SubmissionsModule,
    PaymentModule,
    FileUploadModule,
  ],
  providers: [AppService],
})
export class AppModule {}
