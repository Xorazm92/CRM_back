
// import { Module } from '@nestjs/common';
// import { AttendanceController } from './attendance.controller';
// import { AttendanceService } from './attendance.service';
// import { PrismaService } from '../../common/prisma/prisma.service';
// import { CustomJwtService } from 'src/infrastructure/lib/custom-jwt.service';
// import { JwtModule } from '@nestjs/jwt';


// @Module({
//   imports: [
//     JwtModule.register({
//       secret: process.env.JWT_SECRET,
//       signOptions: { expiresIn: '1d' },
//     }),
//   ],
//   controllers: [AttendanceController],
//   providers: [AttendanceService, PrismaService],
// })
// export class AttendanceModule {}

import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt/custom-jwt.module';

@Module({
  imports: [CustomJwtModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, PrismaService],
})
export class AttendanceModule {}