import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getGeneralStats() {
    const [
      totalStudents,
      totalTeachers,
      totalGroups,
      totalCourses,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.STUDENT } }),
      this.prisma.user.count({ where: { role: UserRole.TEACHER } }),
      this.prisma.groups.count(),
      this.prisma.course.count(),
    ]);

    return {
      totalStudents,
      totalTeachers,
      totalGroups,
      totalCourses,
    };
  }

  async getAttendanceStats() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const attendanceData = await this.prisma.attendance.findMany({
      where: {
        created_at: {
          gte: lastMonth,
        },
      },
      include: {
        lesson: {
          include: {
            group: true,
          },
        },
      },
    });

    // Calculate attendance statistics
    const totalLessons = await this.prisma.lessons.count({
      where: {
        lesson_date: {
          gte: lastMonth,
        },
      },
    });

    const presentCount = attendanceData.filter(a => a.status === 'PRESENT').length;
    const totalAttendance = attendanceData.length;

    return {
      totalLessons,
      averageAttendance: totalAttendance ? (presentCount / totalAttendance) * 100 : 0,
      attendanceByGroup: this.calculateAttendanceByGroup(attendanceData),
      attendanceByDate: this.calculateAttendanceByDate(attendanceData),
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
        group_members: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      totalGroups: groups.length,
      activeGroups: groups.filter(g => g.group_members.length > 0).length,
      studentsPerGroup: groups.map(g => ({
        groupName: g.name,
        studentCount: g._count.group_members,
      })),
    };
  }

  async getTeachersStats() {
    const teachers = await this.prisma.user.findMany({
      where: {
        role: UserRole.TEACHER,
      },
      include: {
        group_members: {
          include: {
            group: true,
          },
        },
      },
    });

    return teachers.map(teacher => ({
      teacherId: teacher.user_id,
      name: teacher.full_name,
      groupsCount: teacher.group_members.length,
      groups: teacher.group_members.map(gm => ({
        groupId: gm.group.group_id,
        groupName: gm.group.name,
      })),
    }));
  }

  private calculateAttendanceByGroup(attendanceData) {
    const groupAttendance = {};
    
    attendanceData.forEach(attendance => {
      const groupName = attendance.lesson.group.name;
      if (!groupAttendance[groupName]) {
        groupAttendance[groupName] = {
          total: 0,
          present: 0,
        };
      }
      
      groupAttendance[groupName].total++;
      if (attendance.status === 'PRESENT') {
        groupAttendance[groupName].present++;
      }
    });

    return Object.entries(groupAttendance).map(([groupName, stats]) => ({
      groupName,
      attendance: (stats.present / stats.total) * 100,
    }));
  }

  private calculateAttendanceByDate(attendanceData) {
    const dateAttendance = {};
    
    attendanceData.forEach(attendance => {
      const date = attendance.created_at.toISOString().split('T')[0];
      if (!dateAttendance[date]) {
        dateAttendance[date] = {
          total: 0,
          present: 0,
        };
      }
      
      dateAttendance[date].total++;
      if (attendance.status === 'PRESENT') {
        dateAttendance[date].present++;
      }
    });

    return Object.entries(dateAttendance).map(([date, stats]) => ({
      date,
      attendance: (stats.present / stats.total) * 100,
    }));
  }
}
