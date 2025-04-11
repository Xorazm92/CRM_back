import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStudentDto: CreateStudentDto) {
    try {
      return await this.prisma.user.create({
        data: {
          ...createStudentDto,
          role: 'STUDENT',
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create student');
    }
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where: { role: 'STUDENT' },
        include: {
          group_members: {
            include: {
              group: {
                include: {
                  course: true,
                  teacher: {
                    select: {
                      user_id: true,
                      full_name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
    ]);

    return {
      data: students,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findOne(id: string) {
    const student = await this.prisma.user.findUnique({
      where: { user_id: id },
      include: {
        group_members: {
          include: {
            group: {
              include: {
                course: true,
                teacher: {
                  select: {
                    user_id: true,
                    full_name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async getProfile(userId: string) {
    const student = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        group_members: {
          include: {
            group: {
              include: {
                course: true,
                teacher: {
                  select: {
                    user_id: true,
                    full_name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const student = await this.prisma.user.findUnique({
      where: { user_id: id },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return await this.prisma.user.update({
      where: { user_id: id },
      data: updateStudentDto,
    });
  }

  async remove(id: string) {
    const student = await this.prisma.user.findUnique({
      where: { user_id: id },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return await this.prisma.user.delete({
      where: { user_id: id },
    });
  }

  async getStudentGroups(userId: string) {
    const groups = await this.prisma.groups.findMany({
      where: {
        group_members: {
          some: {
            user_id: userId,
          },
        },
      },
      include: {
        course: true,
        teacher: {
          select: {
            user_id: true,
            full_name: true,
          },
        },
      },
    });

    return groups;
  }

  async getStudentLessons(userId: string) {
    const lessons = await this.prisma.lessons.findMany({
      where: {
        group: {
          group_members: {
            some: {
              user_id: userId,
            },
          },
        },
      },
      include: {
        group: {
          include: {
            course: true,
            teacher: {
              select: {
                user_id: true,
                full_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        lesson_date: 'asc',
      },
    });

    return lessons;
  }
}