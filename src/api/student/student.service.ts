import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { BcryptEncryption } from '../../infrastructure/lib/bcrypt';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    const hashedPassword = await BcryptEncryption.hashPassword(dto.password);

    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        role: 'STUDENT'
      },
      select: {
        user_id: true,
        username: true,
        full_name: true,
        role: true
      }
    });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [total, students] = await Promise.all([
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.user.findMany({
        where: { role: 'STUDENT' },
        skip,
        take: limit,
        select: {
          user_id: true,
          username: true,
          full_name: true,
          role: true
        }
      })
    ]);

    return {
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const student = await this.prisma.user.findUnique({
      where: { user_id: id, role: 'STUDENT' },
      select: {
        user_id: true,
        username: true,
        full_name: true,
        role: true
      }
    });

    if (!student) throw new NotFoundException(`Student not found`);
    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const student = await this.prisma.user.update({
      where: { user_id: id },
      data: { full_name: updateStudentDto.full_name },
      select: {
        user_id: true,
        username: true,
        full_name: true,
        role: true
      }
    });
    if (!student) throw new NotFoundException(`Student not found`);
    return student;
  }

  async remove(id: string) {
    const student = await this.prisma.user.delete({
      where: { user_id: id }
    });
    if (!student) throw new NotFoundException(`Student not found`);
    return student;
  }

  async getProfile(id: string) {
    const student = await this.prisma.user.findUnique({
      where: { user_id: id, role: 'STUDENT' },
      select: {
        user_id: true,
        username: true,
        full_name: true,
        role: true
      }
    });
    if (!student) throw new NotFoundException(`Student not found`);
    return student;
  }
}