import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserRole, PaymentStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getGeneralStats() {
    const [studentsCount, teachersCount, groupsCount, coursesCount] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.STUDENT } }),
      this.prisma.user.count({ where: { role: UserRole.TEACHER } }),
      this.prisma.groups.count(),
      this.prisma.course.count(),
    ]);

    return {
      students: studentsCount,
      teachers: teachersCount,
      groups: groupsCount,
      courses: coursesCount,
    };
  }

  async getPaymentAnalytics() {
    const [totalPayments, pendingPayments] = await Promise.all([
      this.prisma.studentPayment.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { status: PaymentStatus.COMPLETED }
      }),
      this.prisma.studentPayment.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { status: PaymentStatus.PENDING }
      })
    ]);

    return {
      totalPayments: totalPayments._sum.amount || 0,
      totalCount: totalPayments._count || 0,
      pendingAmount: pendingPayments._sum.amount || 0,
      pendingCount: pendingPayments._count || 0
    };
  }

  async getAttendanceStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalLessons, attendanceStats] = await Promise.all([
      this.prisma.lessons.count(),
      this.prisma.attendance.groupBy({
        by: ['status'],
        _count: true,
        where: {
          created_at: {
            gte: startOfMonth
          }
        }
      })
    ]);

    const presentCount = attendanceStats.find(stat => stat.status === 'PRESENT')?._count ?? 0;
    const totalAttendance = attendanceStats.reduce((acc, stat) => acc + stat._count, 0);

    return {
      totalLessons,
      attendance: totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0,
      details: attendanceStats
    };
  }

  async getDetailedStats() {
    const [
      assignmentsCount,
      submissionsCount,
      activeGroups
    ] = await Promise.all([
      this.prisma.assignments.count(),
      this.prisma.submissions.count(),
      this.prisma.groups.count({
        where: { status: 'ACTIVE' }
      })
    ]);

    return {
      assignments: {
        total: assignmentsCount,
        submissionRate: assignmentsCount > 0 ? (submissionsCount / assignmentsCount) * 100 : 0
      },
      groups: {
        active: activeGroups,
        totalStudents: await this.prisma.user.count({ where: { role: UserRole.STUDENT } }),
        averageSize: activeGroups > 0 ? await this.getAverageGroupSize() : 0
      },
      performance: await this.getOverallPerformance()
    };
  }

  private async getAverageGroupSize() {
    const groups = await this.prisma.groups.findMany({
      include: {
        _count: {
          select: { group_members: true }
        }
      }
    });
    
    return groups.reduce((acc, group) => acc + group._count.group_members, 0) / groups.length;
  }

  private async getOverallPerformance() {
    const submissions = await this.prisma.submissions.findMany({
      select: { grade: true }
    });

    if (submissions.length === 0) return 0;

    return submissions.reduce((acc, sub) => acc + (Number(sub.grade) || 0), 0) / submissions.length;
  }

  async getGroupsStats() {
    const groups = await this.prisma.groups.findMany({
      include: {
        _count: {
          select: { group_members: true }
        }
      }
    });

    return {
      totalGroups: groups.length,
      activeGroups: groups.filter(group => group.status === 'ACTIVE').length,
      averageStudents: groups.reduce((acc, group) => acc + group._count.group_members, 0) / groups.length
    };
  }

  async getTeachersStats() {
    const teachers = await this.prisma.user.findMany({
      where: { role: UserRole.TEACHER },
      include: {
        group_members: {
          include: {
            group: {
              include: {
                group_members: true
              }
            }
          }
        }
      }
    });

    return {
      totalTeachers: teachers.length,
      teachersData: teachers.map(teacher => ({
        name: teacher.username,
        groups: teacher.group_members.length,
        students: teacher.group_members.reduce((acc, member) => {
          const groupMembersCount = member.group.group_members.length;
          return acc + groupMembersCount;
        }, 0),
      })),
    };
  }
}