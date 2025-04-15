import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async create(createLessonDto: any) {
    if (!createLessonDto.topic || typeof createLessonDto.topic !== 'string') {
      throw new BadRequestException('Topic is required');
    }
    return this.prisma.lessons.create({
      data: createLessonDto,
    });
  }

  findAll() {
    return this.prisma.lessons.findMany();
  }

  async findOne(lesson_id: string) {
    return this.prisma.lessons.findUnique({
      where: { lesson_id },
      include: {
        group: true,
        assignments: true,
        attendance: true
      }
    });
  }

  async update(lesson_id: string, updateLessonDto: any) {
    return this.prisma.lessons.update({
      where: { lesson_id },
      data: updateLessonDto,
      include: {
        group: true,
        assignments: true,
        attendance: true
      }
    });
  }

  async remove(lesson_id: string) {
    return this.prisma.lessons.delete({
      where: { lesson_id }
    });
  }
}