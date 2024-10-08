import { Module } from '@nestjs/common';
import { PrismaService } from "src/prisma/prisma.service";
import { UserRepository } from "./repository/user.repository";
import { UserController, } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, UserRepository],
  exports: [UserService]
})
export class UserModule { }
