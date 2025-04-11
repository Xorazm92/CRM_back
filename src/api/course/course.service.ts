import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import Redis from 'ioredis';
import { config } from 'src/config';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    const course = await this.prisma.course.create({
      data: createCourseDto,
    });
    
    await this.redis.del('courses');
    return course;
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    status?: string
  ) {
    const skip = (page - 1) * limit;
    
    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        skip,
        take: limit,
        where: {
          name: search ? {
            contains: search,
            mode: 'insensitive'
          } : undefined,
          status: status ? {
            equals: status as any
          } : undefined
        },
        orderBy: {
          created_at: 'desc'
        }
      }),
      this.prisma.course.count()
    ]);

    return {
      data: courses,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const cacheKey = `course:${id}`;
    const cachedData = await this.redis.get(cacheKey);
    
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const course = await this.prisma.course.findUnique({
      where: { course_id: id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this.redis.set(cacheKey, JSON.stringify(course), 'EX', config.REDIS_EX_TIME);
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    await this.findOne(id);
    
    const updated = await this.prisma.course.update({
      where: { course_id: id },
      data: updateCourseDto,
    });

    await this.redis.del(`course:${id}`);
    await this.redis.del('courses');
    
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    
    const deleted = await this.prisma.course.delete({
      where: { course_id: id },
    });

    await this.redis.del(`course:${id}`);
    await this.redis.del('courses');
    
    return deleted;
  }

  async getCourseGroups(id: string) {
    const cacheKey = `course:${id}:groups`;
    const cachedData = await this.redis.get(cacheKey);
    
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    await this.findOne(id);

    const groups = await this.prisma.groups.findMany({
      where: { course_id: id },
      include: {
        _count: {
          select: { group_members: true },
        },
      },
    });

    await this.redis.set(cacheKey, JSON.stringify(groups), 'EX', config.REDIS_EX_TIME);
    return groups;
  }
}
