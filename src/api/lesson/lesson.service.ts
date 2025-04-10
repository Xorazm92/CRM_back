import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  create(createLessonDto: any) {
    return this.prisma.lessons.create({
      data: createLessonDto,
    });
  }

  findAll() {
    return this.prisma.lessons.findMany();
  }

  findOne(id: string) {
    return this.prisma.lessons.findUnique({
      where: { id },
    });
  }

  update(id: string, updateLessonDto: any) {
    return this.prisma.lessons.update({
      where: { id },
      data: updateLessonDto,
    });
  }

  remove(id: string) {
    return this.prisma.lessons.delete({
      where: { id },
    });
  }
}