import { Module } from '@nestjs/common';
import { GroupMembersService } from './group-members.service';
import { GroupMembersController } from './group-members.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  controllers: [GroupMembersController],
  providers: [GroupMembersService, PrismaService],
})
export class GroupMembersModule {}
