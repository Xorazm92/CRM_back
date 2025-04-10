import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import Redis from 'ioredis';

@Injectable()
export class GroupMembersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}
  async create(CreateGroupMemberDto: CreateGroupMemberDto) {
    const odlUser = this.prisma.user.findUnique({
      where: { user_id: CreateGroupMemberDto.userId },
    });
    if (!odlUser) {
      throw new NotFoundException('User not found!');
    }
    const oldGroup = this.prisma.groups.findUnique({
      where: { group_id: CreateGroupMemberDto.groupId },
    });
    if (!oldGroup) {
      throw new NotFoundException('Group not found!');
    }
    const createdGroupMember = this.prisma.groupMembers.create({
      data: {
        group_id: CreateGroupMemberDto.groupId,
        user_id: CreateGroupMemberDto.userId,
      },
    });
    const keys = await this.redis.keys('groupMembers:page:*');
    if (keys.length) {
      await this.redis.del(...keys);
    }
    return {
      status: HttpStatus.CREATED,
      message: 'New group member created',
      data: createdGroupMember,
    };
  }
  async findAll(page: number, limit: number) {
    const redisKey = `groupMembers:page:${page}:limit:${limit}`;
    const cachedGroupMembers = await this.redis.get(redisKey);
    if (cachedGroupMembers) {
      return JSON.parse(cachedGroupMembers);
    }
    const skip = (page - 1) * limit;
    const allGroupMembers = this.prisma.groupMembers.findMany({
      skip,
      take: limit,
    });
    this.redis.set(redisKey, JSON.stringify(allGroupMembers), 'EX', 60 * 60);

    return {
      status: HttpStatus.OK,
      message: 'All group members',
      data: allGroupMembers,
    };
  }
  async findOne(id: string) {
    const groupMember = await this.prisma.groupMembers.findFirst({
      where: { group_members_id: id },
      include: {
        group: true,
        user: true,
      },
    });

    if (!groupMember) {
      throw new NotFoundException('Group member not found!');
    }

    return {
      status: HttpStatus.OK,
      message: 'Group member found',
      data: groupMember,
    };
  }

  async update(id: string, updateGroupMemberDto: UpdateGroupMemberDto) {
    const groupMember = await this.prisma.groupMembers.findUnique({
      where: { group_members_id: id },
    });
    if (!groupMember) {
      throw new NotFoundException('Group member not found!');
    }
    const updatedGroupMember = await this.prisma.groupMembers.update({
      where: { group_members_id: id },
      data: {
        group_id: updateGroupMemberDto.groupId,
        user_id: updateGroupMemberDto.userId,
      },
    });
    const keys = await this.redis.keys('groupMembers:page:*');
    if (keys.length) {
      await this.redis.del(...keys);
    }
    return {
      status: HttpStatus.OK,
      message: 'Group member updated',
      data: updatedGroupMember,
    };
  }

  async remove(id: string) {
    const groupMember = this.prisma.groupMembers.findUnique({
      where: { group_members_id: id },
    });
    if (!groupMember) {
      throw new NotFoundException('Group member not found!');
    }
    const deletedGroupMember = this.prisma.groupMembers.delete({
      where: { group_members_id: id },
    });
    const keys = await this.redis.keys('groupMembers:page:*');
    if (keys.length) {
      await this.redis.del(...keys);
    }
    return {
      status: HttpStatus.OK,
      message: 'Group member deleted',
      data: deletedGroupMember,
    };
  }
}
