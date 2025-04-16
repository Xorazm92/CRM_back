import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsDto & { monthlyRevenue: number; lastUpdated: Date }> {
    try {
      const [basicStats, financialStats, performanceStats] = await Promise.all([
        this.getBasicStats(),
        this.getFinancialStats(),
        this.getPerformanceStats(),
      ]);
      return {
        ...basicStats,
        ...financialStats,
        ...performanceStats,
        monthlyRevenue: 0, // lint uchun qo'shildi
        lastUpdated: new Date(),
      };
    } catch (e) {
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
    // TODO: implement real logic
    return { message: 'Attendance stats not implemented yet.' };
  }

  private async calculateTotalRevenue() {
    // TODO: implement
    return 0;
  }

  private async compareMonthlyRevenue(lastMonth: Date, currentMonth: Date) {
    // TODO: implement
    return 0;
  }

  private async getUnpaidInvoicesCount() {
    // TODO: implement
    return 0;
  }

  private async calculateAveragePaymentTime() {
    // TODO: implement
    return 0;
  }
}