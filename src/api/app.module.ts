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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    WinstonModule.forRoot({}),
    CustomJwtModule,
    AdminModule,
    GroupModule,
    TeacherModule,
    StudentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    CustomLogger,
  ],
  exports: [CustomLogger],
})
export class AppModule {}
