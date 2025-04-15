import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsDto> {
    const [basicStats, financialStats, performanceStats] = await Promise.all([
      this.getBasicStats(),
      this.getFinancialStats(),
      this.getPerformanceStats()
    ]);

    return {
      ...basicStats,
      ...financialStats,
      ...performanceStats,
      lastUpdated: new Date()
    };
  }

  private async getPerformanceStats() {
    const monthStart = new Date();
    monthStart.setDate(1);

    return {
      bestPerformingCourses: await this.prisma.course.findMany({
        take: 5,
        orderBy: {
          groups: {
            _count: 'desc'
          }
        },
        include: {
          _count: {
            select: { groups: true }
          }
        }
      }),
      
      teacherPerformance: await this.prisma.teacher.findMany({
        take: 5,
        include: {
          _count: {
            select: { groups: true }
          },
          groups: {
            include: {
              _count: {
                select: { students: true }
              }
            }
          }
        }
      })
    };
  }

  private async getFinancialStats() {
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.setMonth(currentMonth.getMonth() - 1));

    return {
      totalRevenue: await this.calculateTotalRevenue(),
      monthlyComparison: await this.compareMonthlyRevenue(lastMonth, currentMonth),
      unpaidInvoices: await this.getUnpaidInvoicesCount(),
      averagePaymentTime: await this.calculateAveragePaymentTime()
    };
  }

  private async getBasicStats() {
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      activeGroups,
      monthlyRevenue,
      attendance
    ] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.teacher.count(),
      this.prisma.course.count(),
      this.prisma.groups.count({ where: { status: 'ACTIVE' } }),
      this.prisma.payment.aggregate({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        },
        _sum: { amount: true }
      }),
      this.prisma.attendance.groupBy({
        by: ['status'],
        _count: true
      })
    ]);

    return {
      totalStudents,
      totalTeachers, 
      totalCourses,
      activeGroups,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      attendance: {
        present: attendance.find(a => a.status === 'PRESENT')?._count || 0,
        absent: attendance.find(a => a.status === 'ABSENT')?._count || 0,
        total: attendance.reduce((acc, curr) => acc + curr._count, 0)
      }
    };
  }

  private async getAttendanceStats() {
    throw new Error('Method not implemented.');
  }

  private async calculateTotalRevenue() {
    throw new Error('Method not implemented.');
  }

  private async compareMonthlyRevenue(lastMonth: Date, currentMonth: Date) {
    throw new Error('Method not implemented.');
  }

  private async getUnpaidInvoicesCount() {
    throw new Error('Method not implemented.');
  }

  private async calculateAveragePaymentTime() {
    throw new Error('Method not implemented.');
  }
}