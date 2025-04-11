import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeacherService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeacherDto: CreateTeacherDto) {
    try {
      return await this.prisma.user.create({
        data: {
          ...createTeacherDto,
          role: 'TEACHER',
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create teacher');
    }
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [teachers, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where: { role: 'TEACHER' },
        include: {
          groups: {
            include: {
              course: true,
              group_members: {
                include: {
                  user: {
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
      this.prisma.user.count({ where: { role: 'TEACHER' } }),
    ]);

    return {
      data: teachers,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findOne(id: string) {
    const teacher = await this.prisma.user.findUnique({
      where: { user_id: id },
      include: {
        groups: {
          include: {
            course: true,
            group_members: {
              include: {
                user: {
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

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    const teacher = await this.prisma.user.findUnique({
      where: { user_id: id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return await this.prisma.user.update({
      where: { user_id: id },
      data: updateTeacherDto,
    });
  }

  async remove(id: string) {
    const teacher = await this.prisma.user.findUnique({
      where: { user_id: id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return await this.prisma.user.delete({
      where: { user_id: id },
    });
  }

  async getProfile(userId: string) {
    const teacher = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        groups: {
          include: {
            course: true,
            group_members: {
              include: {
                user: {
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

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher;
  }

  async getTeacherGroups(userId: string) {
    const groups = await this.prisma.groups.findMany({
      where: {
        teacher_id: userId,
      },
      include: {
        course: true,
        group_members: {
          include: {
            user: {
              select: {
                user_id: true,
                full_name: true,
              },
            },
          },
        },
      },
    });

    return groups;
  }

  async getTeacherLessons(userId: string) {
    const lessons = await this.prisma.lessons.findMany({
      where: {
        group: {
          teacher_id: userId,
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
