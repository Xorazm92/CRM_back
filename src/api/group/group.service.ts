import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create.group.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AlreadyExistsException } from 'src/common/exceptions/already-exists.exception';
import { UpdateGroupDto } from './dto/update.group.dto';

@Injectable()
export class GroupService {
  constructor(private readonly prismaService: PrismaService) {}
  async createGroup(createGroupDto: CreateGroupDto) {
    const isBeenGroup = await this.prismaService.groups.findFirst({
      where: { name: createGroupDto.name },
    });
    if (isBeenGroup) {
      throw new AlreadyExistsException('Group already exist!');
    }
    const newGroup = await this.prismaService.groups.create({
      data: createGroupDto,
    });
    return {
      status: HttpStatus.CREATED,
      message: 'New group created',
      data: newGroup,
    };
  }

  async findAllGroup(adminId: string) {
    const userWithGroups = await this.prismaService.user.findUnique({
      where: {
        user_id: adminId,
      },
      include: {
        group_members: {
          include: {
            group: true,
          },
        },
      },
    });

    // Faqat grouplar ro'yxatini olish:
    const allGroups = userWithGroups.group_members.map(
      (member) => member.group,
    );
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: allGroups,
    };
  }

  async findOneGroup(adminId: string, groupId: string) {
    const groupMember = await this.prismaService.groupMembers.findFirst({
      where: {
        user_id: adminId,
        group_id: groupId,
      },
      include: {
        group: true,
      },
    });

    return {
      status: HttpStatus.OK,
      message: 'success',
      data: groupMember,
    };
  }
  async updateOne(
    adminId: string,
    groupId: string,
    updateGroupDto: UpdateGroupDto,
  ) {
    const currentGroup = await this.prismaService.groups.findUnique({
      where: { group_id: groupId },
    });

    if (!currentGroup) {
      throw new NotFoundException('Group not found!');
    }

    // Check if the new name already exists for a different group
    if (updateGroupDto.name) {
      const existingGroupWithName = await this.prismaService.groups.findFirst({
        where: { 
          AND: [
            { name: updateGroupDto.name },
            { NOT: { group_id: groupId } }
          ]
        },
      });
      
      if (existingGroupWithName) {
        throw new AlreadyExistsException('Name already exist!');
      }
    }

    // Proceed to update the group
    const updatedGroup = await this.prismaService.groups.update({
      where: { group_id: groupId },
      data: updateGroupDto,
      include: {
        group_members: {
          where: { user_id: adminId },
          include: { user: true },
        },
      },
    });

    return {
      status: HttpStatus.OK,
      message: 'success',
      data: updatedGroup,
    };
  }
  async remove(adminId: string, groupId: string) {
    const currentGroup = await this.prismaService.groups.findUnique({
      where: { group_id: groupId },
    });

    if (!currentGroup) {
      throw new NotFoundException('Group not found!');
    }
    const deletedUser = await this.prismaService.groups.delete({
      where: { group_id: groupId },
      include: {
        group_members: {
          where: { user_id: adminId },
          include: { user: true },
        },
      },
    });
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: deletedUser,
    };
  }
}
