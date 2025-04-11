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

  async create(createGroupMemberDto: CreateGroupMemberDto) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: createGroupMemberDto.userId },
    });
    
    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const group = await this.prisma.groups.findUnique({
      where: { group_id: createGroupMemberDto.groupId },
    });
    
    if (!group) {
      throw new NotFoundException('Group not found!');
    }

    const existingMember = await this.prisma.groupMembers.findFirst({
      where: {
        user_id: createGroupMemberDto.userId,
        group_id: createGroupMemberDto.groupId,
      },
    });

    if (existingMember) {
      throw new NotFoundException('User is already a member of this group');
    }

    const createdGroupMember = await this.prisma.groupMembers.create({
      data: {
        group_id: createGroupMemberDto.groupId,
        user_id: createGroupMemberDto.userId,
      },
    });

    // Clear Redis cache
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
    const [groupMembers, total] = await Promise.all([
      this.prisma.groupMembers.findMany({
        skip,
        take: limit,
        include: {
          user: true,
          group: {
            include: {
              course: true,
            },
          },
        },
      }),
      this.prisma.groupMembers.count(),
    ]);

    const response = {
      status: HttpStatus.OK,
      message: 'Group members retrieved successfully',
      data: groupMembers,
      meta: {
        total,
        page,
        limit,
      },
    };

    await this.redis.set(redisKey, JSON.stringify(response), 'EX', 300);
    return response;
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
    const groupMember = await this.prisma.groupMembers.findUnique({
      where: { group_members_id: id },
    });
    if (!groupMember) {
      throw new NotFoundException('Group member not found!');
    }
    const deletedGroupMember = await this.prisma.groupMembers.delete({
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
