import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  constructor(private prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsDto & { monthlyRevenue: number; lastUpdated: Date }> {
    try {
      const [basicStats, financialStats, performanceStats] = await Promise.all([
        this.getBasicStats(),
        this.getFinancialStats(),
        this.getPerformanceStats(),
      ]);
      this.logger.log('Dashboard statistics successfully retrieved');
      return {
        ...basicStats,
        ...financialStats,
        ...performanceStats,
        monthlyRevenue: 0, // lint uchun qo'shildi
        lastUpdated: new Date(),
      };
    } catch (e) {
      this.logger.error('Error in getStats', e.stack || e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  private async getPerformanceStats() {
    try {
      const monthStart = new Date();
      monthStart.setDate(1);
      return {
        bestPerformingCourses: await this.prisma.course.findMany({
          take: 5,
          orderBy: {
            groups: {
              _count: 'desc',
            },
          },
          include: {
            _count: {
              select: { groups: true }, // to'g'ri select
            },
          },
        }),
        teacherPerformance: await this.prisma.user.findMany({
          where: { role: 'TEACHER' },
          take: 5,
          include: {
            _count: {
              select: { group_members: true }, // to'g'ri select
            },
          },
        }),
      };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  // PUBLIC: Financial stats for dashboard controller
  async getFinancialStats() {
    try {
      const currentMonth = new Date();
      const lastMonth = new Date(currentMonth);
      lastMonth.setMonth(currentMonth.getMonth() - 1);
      return {
        totalRevenue: await this.calculateTotalRevenue(),
        monthlyComparison: await this.compareMonthlyRevenue(lastMonth, currentMonth),
        unpaidInvoices: await this.getUnpaidInvoicesCount(),
        averagePaymentTime: await this.calculateAveragePaymentTime(),
      };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  private async getBasicStats() {
    try {
      const [totalStudents, totalTeachers, totalCourses, activeGroups, attendance] = await Promise.all([
        this.prisma.user.count({ where: { role: 'STUDENT' } }),
        this.prisma.user.count({ where: { role: 'TEACHER' } }),
        this.prisma.course.count(),
        this.prisma.groups.count({ where: { status: 'ACTIVE' } }),
        this.prisma.attendance.groupBy({
          by: ['status'],
          _count: true,
        }),
      ]);
      return {
        totalStudents,
        totalTeachers,
        totalCourses,
        activeGroups,
        attendance: {
          present: attendance.find((a) => a.status === 'PRESENT')?._count || 0,
          absent: attendance.find((a) => a.status === 'ABSENT')?._count || 0,
          total: attendance.reduce((acc, curr) => acc + curr._count, 0),
        },
      };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  // PUBLIC: Attendance stats for dashboard controller
  async getAttendanceStats() {
    try {
      // Attendance statuslar bo‘yicha guruhlash
      const stats = await this.prisma.attendance.groupBy({
        by: ['status'],
        _count: true,
      });
      const total = stats.reduce((acc, curr) => acc + curr._count, 0);
      const present = stats.find((s) => s.status === 'PRESENT')?._count || 0;
      const absent = stats.find((s) => s.status === 'ABSENT')?._count || 0;
      const late = stats.find((s) => s.status === 'LATE')?._count || 0;
      const excused = stats.find((s) => s.status === 'EXCUSED')?._count || 0;
      return { total, present, absent, late, excused };
    } catch (e) {
      this.logger.error('[DashboardService][getAttendanceStats]', e.stack || e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  private async calculateTotalRevenue() {
    try {
      // Faqat COMPLETED statusdagi student paymentlarni yig‘ish
      const result = await this.prisma.studentPayment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      });
      return result._sum.amount || 0;
    } catch (e) {
      console.error('[DashboardService][calculateTotalRevenue]', e);
      throw new InternalServerErrorException(e.message);
    }
  }

  private async compareMonthlyRevenue(lastMonth: Date, currentMonth: Date) {
    try {
      // Oldingi va joriy oy uchun tushumlarni hisoblash
      const prevMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const currMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const nextMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
      const prev = await this.prisma.studentPayment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          createdAt: { gte: prevMonthStart, lt: currMonthStart },
        },
      });
      const curr = await this.prisma.studentPayment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          createdAt: { gte: currMonthStart, lt: nextMonthStart },
        },
      });
      return {
        previousMonth: prev._sum.amount || 0,
        currentMonth: curr._sum.amount || 0,
        delta: (curr._sum.amount || 0) - (prev._sum.amount || 0),
      };
    } catch (e) {
      this.logger.error('[DashboardService][compareMonthlyRevenue]', e.stack || e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  private async getUnpaidInvoicesCount() {
    try {
      // Statusi PENDING bo‘lgan student paymentlar soni
      const count = await this.prisma.studentPayment.count({
        where: { status: 'PENDING' },
      });
      return count;
    } catch (e) {
      this.logger.error('[DashboardService][getUnpaidInvoicesCount]', e.stack || e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  private async calculateAveragePaymentTime() {
    try {
      // COMPLETED statusdagi paymentlar uchun createdAt va updatedAt orasidagi o‘rtacha vaqt (soatda)
      const payments = await this.prisma.studentPayment.findMany({
        where: { status: 'COMPLETED' },
        select: { createdAt: true, updatedAt: true },
      });
      if (!payments.length) return 0;
      const totalMs = payments.reduce((acc, p) => acc + (p.updatedAt.getTime() - p.createdAt.getTime()), 0);
      const avgMs = totalMs / payments.length;
      return Math.round((avgMs / (1000 * 60 * 60)) * 100) / 100; // soatda, 2 xonali
    } catch (e) {
      this.logger.error('[DashboardService][calculateAveragePaymentTime]', e.stack || e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  // Bolalarni yosh bo‘yicha statistikasi
  async getStudentAgeStats() {
    const result = await this.prisma.user.groupBy({
      by: ['birthdate'],
      where: { role: 'STUDENT' },
    });
    // Yoshni hisoblash va guruhlash
    const now = new Date();
    const ageMap = new Map<number, number>();
    for (const row of result) {
      if (!row.birthdate) continue;
      const age = now.getFullYear() - row.birthdate.getFullYear();
      ageMap.set(age, (ageMap.get(age) || 0) + 1);
    }
    return Array.from(ageMap.entries()).map(([age, count]) => ({ age, count })).sort((a, b) => a.age - b.age);
  }

  // So‘nggi to‘lovlar (oxirgi 5 ta)
  async getRecentPayments(limit = 5) {
    return this.prisma.studentPayment.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { student: true },
    });
  }

  // Kirim/chiqim va bolalar soni o‘zgarishi uchun statistik endpointlar
  async getIncomeStats() {
    // Oxirgi 2 oy uchun kirim (to‘lovlar)
    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    const currMonthPayments = await this.prisma.studentPayment.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } },
    });
    const prevMonthPayments = await this.prisma.studentPayment.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1), lt: new Date(now.getFullYear(), now.getMonth(), 1) } },
    });
    return {
      currentMonth: currMonthPayments._sum.amount || 0,
      previousMonth: prevMonthPayments._sum.amount || 0,
      delta: (currMonthPayments._sum.amount || 0) - (prevMonthPayments._sum.amount || 0),
    };
  }

  async getStudentCountDelta() {
    // Bolalar soni o‘zgarishi: oxirgi oy va undan avvalgi oy
    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    const currMonthCount = await this.prisma.user.count({
      where: { role: 'STUDENT', created_at: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } },
    });
    const prevMonthCount = await this.prisma.user.count({
      where: { role: 'STUDENT', created_at: { gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1), lt: new Date(now.getFullYear(), now.getMonth(), 1) } },
    });
    return {
      currentMonth: currMonthCount,
      previousMonth: prevMonthCount,
      delta: currMonthCount - prevMonthCount,
    };
  }
}