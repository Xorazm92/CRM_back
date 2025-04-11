import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create.group.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AlreadyExistsException } from 'src/common/exceptions/already-exists.exception';
import { UpdateGroupDto } from './dto/update.group.dto';
import Redis from 'ioredis';
import { config } from 'src/config';
import { Prisma } from '@prisma/client';
import { GroupStatus } from '@prisma/client';

@Injectable()
export class GroupService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  private transformCreateDtoToPrisma(createGroupDto: CreateGroupDto): Prisma.GroupsCreateInput {
    return {
      name: createGroupDto.name,
      description: createGroupDto.description,
      status: createGroupDto.status as GroupStatus,
      course: {
        connect: {
          course_id: createGroupDto.course_id,
        },
      },
      teacher: {
        connect: {
          user_id: createGroupDto.teacher_id,
        },
      },
    };
  }

  private transformUpdateDtoToPrisma(updateGroupDto: UpdateGroupDto): Prisma.GroupsUpdateInput {
    const updateData: Prisma.GroupsUpdateInput = {};
    if (updateGroupDto.name) updateData.name = updateGroupDto.name;
    if (updateGroupDto.description) updateData.description = updateGroupDto.description;
    if (updateGroupDto.status) updateData.status = updateGroupDto.status as GroupStatus;
    if (updateGroupDto.course_id) {
      updateData.course = {
        connect: {
          course_id: updateGroupDto.course_id,
        },
      };
    }
    if (updateGroupDto.teacher_id) {
      updateData.teacher = {
        connect: {
          user_id: updateGroupDto.teacher_id,
        },
      };
    }
    return updateData;
  }

  async createGroup(createGroupDto: CreateGroupDto) { 
    const isBeenGroup = await this.prismaService.groups.findFirst({
      where: { name: createGroupDto.name },
    });
    if (isBeenGroup) {
      throw new AlreadyExistsException('Group with this name already exists');
    }

    // Verify that the course exists
    const course = await this.prismaService.course.findUnique({
      where: { course_id: createGroupDto.course_id }
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    
    const prismaData = this.transformCreateDtoToPrisma(createGroupDto);
    const newGroup = await this.prismaService.groups.create({
      data: prismaData,
    });
    
    return {
      status: HttpStatus.CREATED,
      message: 'New group created',
      data: newGroup,
    };
  }

  async findAllGroup(page: number, limit: number) {
    const redisKey = `groups:page:${page}:limit:${limit}`;
    const cachedGroup = await this.redis.get(redisKey);
    if (cachedGroup) {
      return JSON.parse(cachedGroup);
    }
    const skip = (page - 1) * limit;
    const allGroups = await this.prismaService.groups.findMany({
      skip,
      take: limit,
    });
    await this.redis.set(
      redisKey,
      JSON.stringify(allGroups),
      'EX',
      config.REDIS_EX_TIME,
    );

    return {
      status: HttpStatus.OK,
      message: 'success',
      data: allGroups,
    };
  }

  async findOneGroup(groupId: string) {
    const groupMember = await this.prismaService.groups.findFirst({
      where: { group_id: groupId },
      include: { group_members: true },
    });
    if (!groupMember) {
      throw new NotFoundException('Group not found!');
    }
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: groupMember,
    };
  }

  async updateGroup(groupId: string, updateGroupDto: UpdateGroupDto) {
    const group = await this.prismaService.groups.findUnique({
      where: { group_id: groupId },
    });
    
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const prismaData = this.transformUpdateDtoToPrisma(updateGroupDto);
    const updatedGroup = await this.prismaService.groups.update({
      where: { group_id: groupId },
      data: prismaData,
    });

    // group delete from redis
    const keys = await this.redis.keys('groups:page:*');
    if (keys.length) {
      await this.redis.del(...keys);
    }

    return {
      status: HttpStatus.OK,
      message: 'Group updated successfully',
      data: updatedGroup,
    };
  }

  async remove(groupId: string) {
    const currentGroup = await this.prismaService.groups.findUnique({
      where: { group_id: groupId },
    });

    if (!currentGroup) {
      throw new NotFoundException('Group not found!');
    }
    const deletedUser = await this.prismaService.groups.delete({
      where: { group_id: groupId },
    });

    // group delete from redis
    const keys = await this.redis.keys('groups:page:*');
    if (keys.length) {
      await this.redis.del(...keys);
    }

    return {
      status: HttpStatus.OK,
      message: 'success',
      data: deletedUser,
    };
  }
}
