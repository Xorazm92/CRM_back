import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateStudentPaymentDto } from './dto/create-student-payment.dto';
import { CreateTeacherSalaryDto } from './dto/create-teacher-salary.dto';
import { PaymentStatus } from './dto/payment-status.enum';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async getStudentPaymentHistory(studentId: string) {
    return this.prisma.payment.findMany({
      where: { 
        student_id: studentId,
        type: 'STUDENT_PAYMENT'
      },
      include: {
        student: true,
        course: true
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getMonthlyReport() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return this.prisma.payment.groupBy({
      by: ['type'],
      where: {
        created_at: {
          gte: startOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });
  }

  async createPaymentWithDiscount(dto: CreateStudentPaymentDto, discountPercent: number) {
    const amount = dto.amount * (1 - discountPercent/100);
    
    return this.prisma.payment.create({
      data: {
        amount,
        type: 'STUDENT_PAYMENT',
        status: PaymentStatus.PENDING,
        student: { connect: { id: dto.studentId } },
        discount_percent: discountPercent
      }
    });
  }

  async getPaymentHistory(studentId: string) {
    return this.prisma.studentPayment.findMany({
      where: { student_id: studentId },
      include: {
        discounts: true,
        course: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async applyDiscount(paymentId: string, discountPercent: number) {
    const payment = await this.prisma.studentPayment.findUnique({
      where: { id: paymentId }
    });
    
    const discountedAmount = payment.amount * (1 - discountPercent/100);
    
    return this.prisma.studentPayment.update({
      where: { id: paymentId },
      data: {
        amount: discountedAmount,
        discounts: {
          create: {
            percent: discountPercent,
            appliedAt: new Date()
          }
        }
      }
    });
  }

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