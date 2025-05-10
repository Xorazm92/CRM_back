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
    // 1. Kurs va unga tegishli groupni topish
    const course = await this.prisma.course.findUnique({ where: { course_id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    const group = await this.prisma.groups.findFirst({ where: { course_id: courseId, status: 'ACTIVE' } });
    if (!group) throw new NotFoundException('Group for this course not found');
    // 2. Parametrlarni olish
    const { start_date, lessons_per_week, days_of_week } = dto;
    if (!start_date || !lessons_per_week || !days_of_week?.length) {
      throw new Error('start_date, lessons_per_week va days_of_week majburiy');
    }
    // 3. Darslar soni (duration) va sanalarni hisoblash
    const lessonCount = course.duration;
    const startDate = new Date(start_date);
    const scheduleEntries = [];
    let currentDate = new Date(startDate);
    let lessonIdx = 0;
    // Haftaning kunlari (0-yakshanba, 1-dushanba, ... 6-shanba)
    // lessons_per_week va days_of_week asosida darslarni joylashtiramiz
    while (lessonIdx < lessonCount) {
      for (const day of days_of_week) {
        if (lessonIdx >= lessonCount) break;
        // currentDate ni haftaning kerakli kuniga o‘tkazamiz
        const nextLessonDate = new Date(currentDate);
        nextLessonDate.setDate(
          currentDate.getDate() + ((7 + day - currentDate.getDay()) % 7)
        );
        // start_time va end_time ni sozlash (standart 1 soat)
        const start_time = new Date(nextLessonDate);
        start_time.setHours(10, 0, 0, 0); // 10:00
        const end_time = new Date(nextLessonDate);
        end_time.setHours(11, 0, 0, 0); // 11:00
        scheduleEntries.push({
          schedule_id: crypto.randomUUID(),
          group_id: group.group_id,
          day_of_week: day,
          start_time,
          end_time,
          room: null,
          created_at: new Date(),
          updated_at: new Date(),
        });
        lessonIdx++;
        currentDate = new Date(nextLessonDate);
        currentDate.setDate(currentDate.getDate() + 1); // Keyingi kun
      }
    }
    // 4. Batch tarzida schedule yozuvlarini DBga qo‘shish
    await this.prisma.schedule.createMany({ data: scheduleEntries });
    return { success: true, count: scheduleEntries.length, message: 'Schedule generated successfully' };
  }
}
