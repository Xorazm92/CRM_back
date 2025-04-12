import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAssignmentDto: CreateAssignmentDto) {
    return this.prisma.assignments.create({
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
  }

  async findAll(groupId?: string) {
    return this.prisma.assignments.findMany({
      where: groupId ? { group_id: groupId } : {},
      include: {
        lesson: true,
        group: true,
      },
    });
  }

  async findOne(assignment_id: string) {
    return this.prisma.assignments.findUnique({
      where: { assignment_id },
      include: {
        lesson: true,
        group: true,
      },
    });
  }

  async update(assignment_id: string, updateAssignmentDto: any) {
    return this.prisma.assignments.update({
      where: { assignment_id },
      data: updateAssignmentDto,
      include: {
        lesson: true,
        group: true,
      },
    });
  }

  async remove(assignment_id: string) {
    return this.prisma.assignments.delete({
      where: { assignment_id },
    });
  }
}
