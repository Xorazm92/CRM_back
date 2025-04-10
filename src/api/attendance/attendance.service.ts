
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(createAttendanceDto: any) {
    return this.prisma.attendance.create({
      data: createAttendanceDto,
      include: {
        student: true,
        lesson: true
      }
    });
  }

  async findAll(groupId?: string, date?: Date) {
    return this.prisma.attendance.findMany({
      where: {
        group_id: groupId,
        date: date ? new Date(date) : undefined
      },
      include: {
        student: true,
        lesson: true,
        group: true
      }
    });
  }

  async getStudentAttendance(studentId: string) {
    return this.prisma.attendance.findMany({
      where: { student_id: studentId },
      include: {
        lesson: true,
        group: true
      }
    });
  }

  async getGroupAttendanceStats(groupId: string) {
    const attendances = await this.prisma.attendance.findMany({
      where: { group_id: groupId }
    });

    const total = attendances.length;
    const present = attendances.filter(a => a.status === 'PRESENT').length;
    const absent = attendances.filter(a => a.status === 'ABSENT').length;

    return {
      total,
      present,
      absent,
      presentPercentage: (present / total) * 100,
      absentPercentage: (absent / total) * 100
    };
  }

  async findOne(id: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        student: true,
        lesson: true,
        group: true
      }
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return attendance;
  }

  async update(id: string, updateAttendanceDto: any) {
    await this.findOne(id);
    
    return this.prisma.attendance.update({
      where: { id },
      data: updateAttendanceDto,
      include: {
        student: true,
        lesson: true
      }
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.attendance.delete({ where: { id } });
  }
}
