import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsDto> {
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