import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create.group.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AlreadyExistsException } from 'src/common/exceptions/already-exists.exception';
import { UpdateGroupDto } from './dto/update.group.dto';

@Injectable()
export class GroupService {
  constructor(private readonly prismaService: PrismaService) {}

  private formatResponse<T>(status: HttpStatus, message: string, data: T) {
    return {
      status,
      message,
      data
    };
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

    try {
      const newGroup = await this.prismaService.groups.create({
        data: {
          name: createGroupDto.name,
          description: createGroupDto.description,
          course: {
            connect: {
              course_id: createGroupDto.course_id
            }
          }
        },
        include: {
          course: true
        }
      });

      return this.formatResponse(
        HttpStatus.CREATED,
        'New group created successfully',
        newGroup
      );
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Course not found');
      }
      throw error;
    }
  }

  async findAllGroup() {
    const allGroups = await this.prismaService.groups.findMany({
      include: { 
        group_members: true,
        course: true 
      },
    });

    return this.formatResponse(
      HttpStatus.OK,
      'Groups retrieved successfully',
      allGroups
    );
  }

  async findOneGroup(groupId: string) {
    const group = await this.prismaService.groups.findFirst({
      where: { group_id: groupId },
      include: { 
        group_members: { include: { user: true } },
        course: true 
      },
    });
    
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Map group_members to students array for response
    const students = group.group_members.map((member: any) => member.user);
    const response = {
      group_id: group.group_id,
      name: group.name,
      students,
      // add other fields as needed
    };

    return this.formatResponse(
      HttpStatus.OK,
      'Group retrieved successfully',
      response
    );
  }

  async updateOne(groupId: string, updateGroupDto: UpdateGroupDto) {
    const currentGroup = await this.prismaService.groups.findUnique({
      where: { group_id: groupId },
    });

    if (!currentGroup) {
      throw new NotFoundException('Group not found');
    }

    if (updateGroupDto.name) {
      const existingGroupWithName = await this.prismaService.groups.findFirst({
        where: {
          AND: [{ name: updateGroupDto.name }, { NOT: { group_id: groupId } }],
        },
      });

      if (existingGroupWithName) {
        throw new AlreadyExistsException('Group with this name already exists');
      }
    }

    const updatedGroup = await this.prismaService.groups.update({
      where: { group_id: groupId },
      data: updateGroupDto,
      include: {
        course: true,
        group_members: true
      }
    });

    return this.formatResponse(
      HttpStatus.OK,
      'Group updated successfully',
      updatedGroup
    );
  }

  async remove(groupId: string) {
    const currentGroup = await this.prismaService.groups.findUnique({
      where: { group_id: groupId },
    });

    if (!currentGroup) {
      throw new NotFoundException('Group not found');
    }

    const deletedGroup = await this.prismaService.groups.delete({
      where: { group_id: groupId },
      include: {
        course: true,
        group_members: true
      }
    });

    return this.formatResponse(
      HttpStatus.OK,
      'Group deleted successfully',
      deletedGroup
    );
  }
}
