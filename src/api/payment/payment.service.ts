import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateStudentPaymentDto } from './dto/create-student-payment.dto';
import { CreateTeacherSalaryDto } from './dto/create-teacher-salary.dto';
import { PaymentType, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async createStudentPayment(dto: CreateStudentPaymentDto) {
    const student = await this.prisma.user.findUnique({
      where: { user_id: dto.student_id },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return this.prisma.studentPayment.create({
      data: {
        amount: dto.amount,
        type: PaymentType.MONTHLY,
        status: PaymentStatus.PENDING
      }
    });
  }

  async createTeacherSalary(dto: CreateTeacherSalaryDto) {
    const teacher = await this.prisma.user.findUnique({
      where: { user_id: dto.teacher_id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return this.prisma.teacherSalary.create({
      data: {
        amount: dto.amount,
        status: PaymentStatus.PENDING
      }
    });
  }

  async getStudentPayments(studentId: string) {
    return this.prisma.studentPayment.findMany({
      where: { id: studentId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTeacherSalaries(teacherId: string) {
    return this.prisma.teacherSalary.findMany({
      where: { id: teacherId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    return this.prisma.studentPayment.update({
      where: { id: paymentId },
      data: { status },
    });
  }

  async updateSalaryStatus(salaryId: string, status: PaymentStatus) {
    return this.prisma.teacherSalary.update({
      where: { id: salaryId },
      data: { status },
    });
  }
}
