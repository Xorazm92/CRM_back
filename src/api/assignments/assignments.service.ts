import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAssignmentDto: CreateAssignmentDto) {
    try {
      return await this.prisma.assignments.create({
        data: {
          title: createAssignmentDto.title,
          description: createAssignmentDto.description,
          due_date: createAssignmentDto.deadline,
          lesson: {
            connect: {
              lesson_id: createAssignmentDto.lesson_id
            }
          },
          group: {
            connect: {
              group_id: createAssignmentDto.group_id
            }
          }
        },
        include: {
          lesson: true,
          group: true
        }
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findAll(groupId?: string) {
    try {
      return await this.prisma.assignments.findMany({
        where: groupId ? { group_id: groupId } : {},
        include: {
          lesson: true,
          group: true,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async findOne(assignment_id: string) {
    try {
      const assignment = await this.prisma.assignments.findUnique({
        where: { assignment_id },
        include: {
          lesson: true,
          group: true,
        },
      });
      if (!assignment) throw new NotFoundException('Assignment not found');
      return assignment;
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  async update(assignment_id: string, updateAssignmentDto: UpdateAssignmentDto) {
    try {
      return await this.prisma.assignments.update({
        where: { assignment_id },
        data: updateAssignmentDto,
        include: {
          lesson: true,
          group: true,
        },
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async remove(assignment_id: string) {
    try {
      return await this.prisma.assignments.delete({
        where: { assignment_id },
      });
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
