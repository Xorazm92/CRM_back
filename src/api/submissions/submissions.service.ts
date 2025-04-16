import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSubmissionDto: CreateSubmissionDto) {
    // Student bir assignmentga faqat bir marta topshira oladi
    const exists = await this.prisma.submissions.findFirst({
      where: {
        assignment_id: createSubmissionDto.assignment_id,
        student_id: createSubmissionDto.student_id
      }
    });
    if (exists) {
      throw new Error('Siz bu assignmentga allaqachon topshirgansiz!');
    }
    return this.prisma.submissions.create({
      data: {
        assignment_id: createSubmissionDto.assignment_id,
        student_id: createSubmissionDto.student_id,
        file_path: createSubmissionDto.file_path,
        answer_text: createSubmissionDto.answer_text,
      },
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

  async getByAssignment(assignmentId: string) {
    return this.prisma.submissions.findMany({
      where: { assignment_id: assignmentId },
      include: {
        assignment: true,
        student: true,
        graded: true,
      },
    });
  }

  async update(id: string, updateSubmissionDto: UpdateSubmissionDto) {
    // Agar baholash bo'lsa graded_by va feedback ham yangilanadi
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
