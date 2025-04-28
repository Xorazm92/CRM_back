import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
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
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt.module';
import { SettingModule } from './setting/setting.module';
import { TransactionModule } from './transaction/transaction.module';
import { ScheduleModule } from './schedule/schedule.module';

// StudentModule va TeacherModule olib tashlandi, endi UserModule universal
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60000
    }),
    CustomJwtModule,
    AuthModule,
    UserModule,
    AdminModule,
    CourseModule,
    GroupModule,
    DashboardModule,
    LessonModule,
    AttendanceModule,
    AssignmentsModule,
    SubmissionsModule,
    PaymentModule,
    FileUploadModule,
    SettingModule,
    TransactionModule,
    ScheduleModule,
  ],
})
export class AppModule {}
