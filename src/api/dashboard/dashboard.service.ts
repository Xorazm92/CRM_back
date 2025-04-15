import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsDto> {
    const [basicStats, financialStats, attendanceStats, performanceStats] = await Promise.all([
      this.getBasicStats(),
      this.getFinancialStats(),
      this.getAttendanceStats(),
      this.getPerformanceStats()
    ]);

    return {
      ...basicStats,
      ...financialStats,
      ...attendanceStats,
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
          students: {
            _count: 'desc'
          }
        },
        include: {
          _count: {
            select: { students: true }
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
      this.getBasicStats(),
      this.getFinancialStats(),
      this.getDetailedAttendanceStats()
    ]);

    return {
      ...basicStats,
      ...financialStats,
      ...attendanceStats,
      revenueByMonth: await this.getRevenueByMonth(),
      studentGrowth: await this.getStudentGrowthStats(),
      coursePerformance: await this.getCoursePerformanceStats()
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
      this.prisma.group.count({ where: { status: 'ACTIVE' } }),
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
}