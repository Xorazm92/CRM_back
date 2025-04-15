import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async create(createLessonDto: any) {
    if (!createLessonDto.topic || typeof createLessonDto.topic !== 'string') {
      throw new BadRequestException('Topic is required');
    }
    try {
      const lesson = await this.prisma.lessons.create({
        data: createLessonDto,
      });
      return { status: 201, message: 'Lesson created', data: lesson };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async findAll() {
    try {
      const lessons = await this.prisma.lessons.findMany();
      return { status: 200, message: 'success', data: lessons };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async findOne(lesson_id: string) {
    try {
      const lesson = await this.prisma.lessons.findUnique({
        where: { lesson_id },
        include: {
          group: true,
          assignments: true,
          attendance: true
        }
      });
      if (!lesson) throw new NotFoundException('Lesson not found');
      return { status: 200, message: 'success', data: lesson };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async update(lesson_id: string, updateLessonDto: any) {
    try {
      const lesson = await this.prisma.lessons.update({
        where: { lesson_id },
        data: updateLessonDto,
        include: {
          group: true,
          assignments: true,
          attendance: true
        }
      });
      return { status: 200, message: 'Lesson updated', data: lesson };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async remove(lesson_id: string) {
    try {
      await this.prisma.lessons.delete({ where: { lesson_id } });
      return { status: 200, message: 'Lesson deleted' };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}