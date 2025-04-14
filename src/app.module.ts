import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './api/user/user.module';
import { AuthModule } from './api/auth/auth.module';
import { AdminModule } from './api/admin/admin.module';
import { CourseModule } from './api/course/course.module';
import { GroupModule } from './api/group/group.module';
import { StudentModule } from './api/student/student.module';
import { TeacherModule } from './api/teacher/teacher.module';
import { PaymentModule } from './api/payment/payment.module';
import { AttendanceModule } from './api/attendance/attendance.module';
import { LessonModule } from './api/lesson/lesson.module';
import { AssignmentsModule } from './api/assignments/assignments.module';
import { DashboardModule } from './api/dashboard/dashboard.module';
import { FileUploadModule } from './api/fileupload/fileupload.module';
import { SubmissionsModule } from './api/submissions/submissions.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { CustomJwtModule } from './infrastructure/lib/custom-jwt/custom-jwt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    CustomJwtModule,
    PrismaModule,
    UserModule,
    AuthModule,
    AdminModule,
    CourseModule,
    GroupModule,
    StudentModule,
    TeacherModule,
    PaymentModule,
    AttendanceModule,
    LessonModule,
    AssignmentsModule,
    DashboardModule,
    FileUploadModule,
    SubmissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}