import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './core/auth/auth.module';
import { UserModule } from './api/user/user.module';
import { AdminModule } from './api/admin/admin.module';
import { TeacherModule } from './api/teacher/teacher.module';
import { StudentModule } from './api/student/student.module';
import { CourseModule } from './api/course/course.module';
import { GroupModule } from './api/group/group.module';
import { DashboardModule } from './api/dashboard/dashboard.module';
import { LessonModule } from './api/lesson/lesson.module';
import { AttendanceModule } from './api/attendance/attendance.module';
import { AssignmentsModule } from './api/assignments/assignments.module';
import { SubmissionsModule } from './api/submissions/submissions.module';
import { PaymentModule } from './api/payment/payment.module';
import { FileUploadModule } from './api/fileupload/fileupload.module';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './infrastructure/lib/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60000
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
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
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
