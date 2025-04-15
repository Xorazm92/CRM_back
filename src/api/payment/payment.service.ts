import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateStudentPaymentDto } from './dto/create-student-payment.dto';
import { CreateTeacherSalaryDto } from './dto/create-teacher-salary.dto';
import { PaymentStatus } from './dto/payment-status.enum';

@Injectable()
export class PaymentService {
  getTeacherSalaryHistory(id: string) {
    throw new Error('Method not implemented.');
  }
  getStudentPayments(id: string) {
    throw new Error('Method not implemented.');
  }
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
      _sum: { amount: true },
      _count: true
    });
  }

  async createPaymentWithDiscount(dto: CreateStudentPaymentDto, discountPercent: number) {
    const amount = dto.amount * (1 - discountPercent/100);
    
    return this.prisma.payment.create({
      data: {
        amount,
        type: 'STUDENT_PAYMENT',
        status: PaymentStatus.PENDING,
        student: { connect: { id: dto.student_id } },
        discount_percent: discountPercent
      }
    });
  }

  async getPaymentHistory(studentId: string) {
    return this.prisma.payment.findMany({
      where: { student_id: studentId },
      include: {
        student: true,
        course: true
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getPaymentDetails(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId }
    });
    
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }
    
    return payment;
  }

  async createStudentPayment(dto: CreateStudentPaymentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.student_id }
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${dto.student_id} not found`);
    }

    return this.prisma.payment.create({
      data: {
        amount: dto.amount,
        type: 'STUDENT_PAYMENT',
        status: dto.status,
        student: { connect: { id: dto.student_id } },
        payment_date: dto.payment_type,
        payment_type: dto.payment_type
      }
    });
  }

  async createTeacherSalary(dto: CreateTeacherSalaryDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: dto.teacher_id }
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${dto.teacher_id} not found`);
    }

    return this.prisma.payment.create({
      data: {
        amount: dto.amount,
        type: 'TEACHER_SALARY',
        status: dto.status,
        teacher: { connect: { id: dto.teacher_id } },
        payment_date: dto.payment_date,
        payment_type: dto.payment_type
      }
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus) {
    return this.prisma.payment.update({
      where: { id },
      data: { status }
    });
  }

  async updateSalaryStatus(id: string, status: PaymentStatus) {
    return this.prisma.payment.update({
      where: { id },
      data: { status }
    });
  }

  async getPaymentStats() {
    return this.prisma.payment.groupBy({
      by: ['status'],
      _count: true
    });
  }
}