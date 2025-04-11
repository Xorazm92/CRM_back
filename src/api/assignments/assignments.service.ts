import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAssignmentDto: any) {
    return this.prisma.assignments.create({
      data: {
        ...createAssignmentDto,
        deadline: new Date(createAssignmentDto.deadline),
      },
      include: {
        lesson: true,
        group: true,
      }
    });
  }

  async findAll(groupId?: string) {
    return this.prisma.assignments.findMany({
      where: groupId ? { group_id: groupId } : {},
      include: {
        lesson: true,
        group: true,
        submissions: {
          include: {
            student: true
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const assignment = await this.prisma.assignments.findUnique({
      where: { id },
      include: {
        lesson: true,
        group: true,
        submissions: {
          include: {
            student: true
          }
        }
      }
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    return assignment;
  }

  async update(id: string, updateAssignmentDto: any) {
    await this.findOne(id);

    return this.prisma.assignments.update({
      where: { id },
      data: updateAssignmentDto,
      include: {
        lesson: true,
        group: true
      }
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.assignments.delete({ where: { id } });
  }

  async getSubmissions(assignmentId: string) {
    return this.prisma.submissions.findMany({
      where: { assignment_id: assignmentId },
      include: {
        student: true,
        assignment: true
      }
    });
  }
}