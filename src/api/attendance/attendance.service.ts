import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(createAttendanceDto: any) {
    if (!createAttendanceDto.lessonId || !createAttendanceDto.studentId || !createAttendanceDto.status) {
      throw new BadRequestException('lessonId, studentId va status majburiy!');
    }
    return this.prisma.attendance.create({
      data: {
        lesson_id: createAttendanceDto.lessonId,
        student_id: createAttendanceDto.studentId,
        status: createAttendanceDto.status,
        remarks: createAttendanceDto.remarks,
      },
      include: {
        student: true,
        lesson: true
      }
    });
  }

  async findAll(groupId?: string, date?: Date) {
    return this.prisma.attendance.findMany({
      where: groupId ? {
        lesson: {
          group_id: groupId
        }
      } : {},
      include: {
        student: true,
        lesson: true
      }
    });
  }

  async getStudentAttendance(studentId: string) {
    return this.prisma.attendance.findMany({
      where: { student_id: studentId },
      include: {
        lesson: true,
        student: true
      }
    });
  }

  async getGroupAttendanceStats(groupId: string) {
    const attendances = await this.prisma.attendance.findMany({
      where: {
        lesson: {
          group_id: groupId
        }
      },
      include: {
        lesson: true,
        student: true
      }
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

  async findOne(attendance_id: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { attendance_id },
      include: {
        student: true,
        lesson: true
      }
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${attendance_id} not found`);
    }

    return attendance;
  }

  async update(attendance_id: string, updateAttendanceDto: any) {
    await this.findOne(attendance_id);
    
    return this.prisma.attendance.update({
      where: { attendance_id },
      data: updateAttendanceDto,
      include: {
        student: true,
        lesson: true
      }
    });
  }

  async remove(attendance_id: string) {
    await this.findOne(attendance_id);
    return this.prisma.attendance.delete({ where: { attendance_id } });
  }
}
