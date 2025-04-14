
// import { Module } from '@nestjs/common';
// import { AssignmentsController } from './assignments.controller';
// import { AssignmentsService } from './assignments.service';
// import { PrismaService } from '../../common/prisma/prisma.service';
// import { JwtModule } from '@nestjs/jwt';
// import { CustomJwtService } from 'src/infrastructure/lib/custom-jwt.service';

// @Module({
//   imports: [
//     JwtModule.register({
//       secret: process.env.JWT_SECRET,
//       signOptions: { expiresIn: '1d' },
//     }),
//   ],
//   controllers: [AssignmentsController],
//   providers: [AssignmentsService, PrismaService],
// })
// export class AssignmentsModule {}


import { Module } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt/custom-jwt.module';

@Module({
  imports: [CustomJwtModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, PrismaService],
})
export class AssignmentsModule {}