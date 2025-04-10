
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  create(createLessonDto: any) {
    return this.prisma.lesson.create({
      data: createLessonDto,
    });
  }

  findAll() {
    return this.prisma.lesson.findMany();
  }

  findOne(id: string) {
    return this.prisma.lesson.findUnique({
      where: { id },
    });
  }

  update(id: string, updateLessonDto: any) {
    return this.prisma.lesson.update({
      where: { id },
      data: updateLessonDto,
    });
  }

  remove(id: string) {
    return this.prisma.lesson.delete({
      where: { id },
    });
  }
}
