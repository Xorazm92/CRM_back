import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

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

  async getAttendanceStats() {
    const totalLessons = await this.prisma.lessons.count();
    const attendanceStats = await this.prisma.attendance.groupBy({
      by: ['status'],
      _count: true,
    });

    const presentCount = attendanceStats.find(stat => stat.status === 'PRESENT')?._count ?? 0;
    const totalAttendance = attendanceStats.reduce((acc, stat) => acc + stat._count, 0);

    return {
      totalLessons,
      attendance: totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0,
      details: attendanceStats,
    };
  }

  async getGroupsStats() {
    const groups = await this.prisma.groups.findMany({
      include: {
        _count: {
          select: {
            group_members: true,
          },
        },
      },
    });

    return {
      totalGroups: groups.length,
      activeGroups: groups.filter(group => group.status === 'ACTIVE').length,
      averageStudents: groups.reduce((acc, group) => acc + group._count.group_members, 0) / groups.length,
      groupsData: groups.map(group => ({
        name: group.name,
        status: group.status,
        students: group._count.group_members,
      })),
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
