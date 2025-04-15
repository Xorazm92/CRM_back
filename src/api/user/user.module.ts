// user.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt.module';


@Module({
  imports: [PrismaModule, CustomJwtModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}