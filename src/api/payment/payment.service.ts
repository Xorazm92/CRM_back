import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateStudentPaymentDto } from './dto/create-student-payment.dto';
import { CreateTeacherSalaryDto } from './dto/create-teacher-salary.dto';
import { PaymentStatus } from './dto/payment-status.enum';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async createStudentPayment(dto: CreateStudentPaymentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId }
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return this.prisma.payment.create({
      data: {
        amount: dto.amount,
        status: PaymentStatus.COMPLETED,
        type: 'STUDENT_PAYMENT',
        description: dto.description,
        student: { connect: { id: dto.studentId } }
      }
    });
  }

  async createTeacherSalary(dto: CreateTeacherSalaryDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: dto.teacherId }
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return this.prisma.payment.create({
      data: {
        amount: dto.amount,
        status: PaymentStatus.COMPLETED,
        type: 'TEACHER_SALARY',
        description: dto.description,
        teacher: { connect: { id: dto.teacherId } }
      }
    });
  }

  async getPaymentStats() {
    return this.prisma.payment.groupBy({
      by: ['type', 'status'],
      _sum: { amount: true },
      _count: true
    });
  }
}