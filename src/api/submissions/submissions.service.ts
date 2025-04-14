import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSubmissionDto: CreateSubmissionDto) {
    return this.prisma.submissions.create({
      data: createSubmissionDto,
    });
  }

  async findAll() {
    return this.prisma.submissions.findMany({
      include: {
        assignment: true,
        student: true,
        graded: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.submissions.findUnique({
      where: { submission_id: id },
      include: {
        assignment: true,
        student: true,
        graded: true,
      },
    });
  }

  async update(id: string, updateSubmissionDto: UpdateSubmissionDto) {
    return this.prisma.submissions.update({
      where: { submission_id: id },
      data: updateSubmissionDto,
    });
  }

  async remove(id: string) {
    return this.prisma.submissions.delete({
      where: { submission_id: id },
    });
  }
}
