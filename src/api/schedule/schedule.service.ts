import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.schedule.findMany();
  }

  async findOne(id: string) {
    const schedule = await this.prisma.schedule.findUnique({ where: { schedule_id: id } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  async create(dto: any) {
    return this.prisma.schedule.create({ data: dto });
  }

  async update(id: string, dto: any) {
    return this.prisma.schedule.update({ where: { schedule_id: id }, data: dto });
  }

  async generateSchedule(courseId: string, dto: { start_date: string, lessons_per_week: number, days_of_week: number[] }) {
    // TODO: Kurs syllabusini olib, dars va jadval bandlarini avtomatik generatsiya qilish logikasini yozish
    return { success: true, message: 'Schedule generation stub. Logic to be implemented.' };
  }
}
