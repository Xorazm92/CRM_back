import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PaymentType, PaymentStatus } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateStudentPaymentDto } from './dto/create-student-payment.dto';
import { CreateTeacherSalaryDto } from './dto/create-teacher-salary.dto';

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
    return this.prisma.studentPayment.findMany({
      where: { student_id: studentId },
      orderBy: { createdAt: 'desc' },
      include: { student: true },
    });
  }

  async getMonthlyReport() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return this.prisma.studentPayment.groupBy({
      by: ['type'],
      where: { createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
      _count: true,
    });
  }

  async createStudentPayment(dto: CreateStudentPaymentDto) {
    // 1. Studentni tekshirish
    const student = await this.prisma.user.findUnique({ where: { user_id: dto.student_id } });
    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException(`Student with ID ${dto.student_id} not found`);
    }
    // 2. Chegirma aniqlash
    let discountPercent = 0;
    if (dto.description && dto.description.includes('discount:')) {
      const match = dto.description.match(/discount:(\d+)/);
      if (match) discountPercent = Number(match[1]);
    }
    // 3. To'lov summasini hisoblash
    const discountedAmount = dto.amount * (1 - discountPercent / 100);
    // 4. 30 kunlik cheklov
    const lastPayment = await this.prisma.studentPayment.findFirst({
      where: { student_id: dto.student_id, type: dto.payment_type },
      orderBy: { createdAt: 'desc' },
    });
    if (lastPayment) {
      const now = new Date();
      const diffDays = (now.getTime() - lastPayment.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays < 30) {
        throw new Error('Har oy faqat bir marta toʻlov qilishingiz mumkin!');
      }
    }
    // 5. Student payment yozish
    const paymentData: any = {
      student_id: dto.student_id,
      amount: discountedAmount,
      type: dto.payment_type as PaymentType,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // description faqat modelda mavjud bo‘lsa qo‘shamiz
    // (Prisma modelda yo‘q, shuning uchun qo‘shmaymiz)
    // if (dto.description) paymentData.description = dto.description;
    const payment = await this.prisma.studentPayment.create({
      data: paymentData,
    });
    return { payment, discountPercent };
  }

  async createTeacherSalary(dto: CreateTeacherSalaryDto) {
    const teacher = await this.prisma.user.findUnique({ where: { user_id: dto.teacher_id } });
    if (!teacher || teacher.role !== 'TEACHER') {
      throw new NotFoundException(`Teacher with ID ${dto.teacher_id} not found`);
    }
    return this.prisma.teacherSalary.create({
      data: {
        amount: dto.amount,
        status: dto.status as PaymentStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
        // qo'shimcha fieldlar kerak bo'lsa shu yerda
      },
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus) {
    return this.prisma.studentPayment.update({
      where: { id },
      data: { status: { set: status } },
    });
  }

  async updateSalaryStatus(id: string, status: PaymentStatus) {
    return this.prisma.teacherSalary.update({
      where: { id },
      data: { status: { set: status } },
    });
  }

  async getPaymentStats() {
    return this.prisma.studentPayment.groupBy({
      by: ['status'],
      _count: true,
    });
  }

  // Barcha studentlarning barcha to'lovlarini olish (admin/statistika uchun)
  async getAllStudentPayments() {
    return this.prisma.studentPayment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { student: true }
    });
  }

  // Barcha teacher’larning oyligini avtomat hisoblash va yozish
  async calculateTeacherSalaries() {
    // 1. Barcha o'qituvchilarni olish
    const teachers = await this.prisma.user.findMany({ where: { role: 'TEACHER' } });
    if (!teachers || teachers.length === 0) {
      throw new NotFoundException('Hech qanday o‘qituvchi topilmadi');
    }
    // 2. Har bir teacher uchun oylik hisoblash va yozish
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const results = [];
    for (const teacher of teachers) {
      // 1. O'qituvchining guruhlari (GroupMembers orqali)
      const teacherGroups = await this.prisma.groups.findMany({
        where: {
          group_members: {
            some: {
              user_id: teacher.user_id
            }
          }
        },
        include: {
          group_members: true
        }
      });
      // 2. O'qituvchi dars o'tadigan har bir guruhdagi o'quvchilar
      let totalStudentPayments = 0;
      for (const group of teacherGroups) {
        // Guruhdagi o'quvchilar (GroupMembers)
        const groupMembers = await this.prisma.groupMembers.findMany({
          where: { group_id: group.group_id },
        });
        const studentIds = groupMembers.map((m) => m.user_id);
        // Shu oyda to'lov qilgan o'quvchilar
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 1);
        const payments = await this.prisma.studentPayment.findMany({
          where: {
            student_id: { in: studentIds },
            createdAt: {
              gte: startOfMonth,
              lt: endOfMonth
            },
            status: 'COMPLETED'
          }
        });
        // To'lovlarning jami summasi
        const groupPaymentsSum = payments.reduce((sum, p) => sum + p.amount, 0);
        totalStudentPayments += groupPaymentsSum;
      }
      // 3. O'qituvchi oyligi: jami to'lovlarning 30%
      let salary = totalStudentPayments * 0.3;
      // 5. Shu oy uchun teacherSalary yozilganmi, tekshirish
      const existingSalary = await this.prisma.teacherSalary.findFirst({
        where: {
          id: teacher.user_id,
          createdAt: {
            gte: new Date(year, month, 1),
            lt: new Date(year, month + 1, 1)
          }
        }
      });
      if (!existingSalary) {
        // Yangi oylik yozamiz
        const salaryRecord = await this.prisma.teacherSalary.create({
          data: {
            id: teacher.user_id,
            amount: Math.round(salary),
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
        results.push(salaryRecord);
      } else {
        results.push({ teacher_id: teacher.user_id, message: 'Bu oy uchun allaqachon yozilgan' });
      }
    }
    return { count: results.length, results };
  }
}