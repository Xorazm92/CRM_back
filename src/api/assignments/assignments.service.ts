
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  create(createAssignmentDto: any) {
    return this.prisma.assignment.create({
      data: createAssignmentDto,
    });
  }

  findAll() {
    return this.prisma.assignment.findMany();
  }

  findOne(id: string) {
    return this.prisma.assignment.findUnique({
      where: { id },
    });
  }

  update(id: string, updateAssignmentDto: any) {
    return this.prisma.assignment.update({
      where: { id },
      data: updateAssignmentDto,
    });
  }

  remove(id: string) {
    return this.prisma.assignment.delete({
      where: { id },
    });
  }
}
