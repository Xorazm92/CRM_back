
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  create(createAttendanceDto: any) {
    return this.prisma.attendance.create({
      data: createAttendanceDto,
    });
  }

  findAll() {
    return this.prisma.attendance.findMany();
  }

  findOne(id: string) {
    return this.prisma.attendance.findUnique({
      where: { id },
    });
  }

  update(id: string, updateAttendanceDto: any) {
    return this.prisma.attendance.update({
      where: { id },
      data: updateAttendanceDto,
    });
  }

  remove(id: string) {
    return this.prisma.attendance.delete({
      where: { id },
    });
  }
}
