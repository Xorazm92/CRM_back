import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDiscountDto) {
    // Student mavjudligini tekshirish
    const student = await this.prisma.user.findUnique({ where: { user_id: dto.student_id } });
    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException(`Student with ID ${dto.student_id} not found`);
    }
    return this.prisma.discount.create({
      data: {
        student_id: dto.student_id,
        percent: dto.percent,
        description: dto.description,
        valid_from: new Date(dto.valid_from),
        valid_to: new Date(dto.valid_to),
      },
    });
  }

  async findAll() {
    return this.prisma.discount.findMany({
      orderBy: { created_at: 'desc' },
      include: { student: true },
    });
  }

  async findByStudent(student_id: string) {
    return this.prisma.discount.findMany({
      where: { student_id },
      orderBy: { created_at: 'desc' },
    });
  }

  async findActiveByStudent(student_id: string) {
    const now = new Date();
    return this.prisma.discount.findFirst({
      where: {
        student_id,
        valid_from: { lte: now },
        valid_to: { gte: now },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async remove(id: string) {
    return this.prisma.discount.delete({ where: { id } });
  }
}
