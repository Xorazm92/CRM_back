import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { FindCoursesQueryDto } from './dto/find-courses-query.dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto) {
    if (!createCourseDto.name || !createCourseDto.status) {
      throw new BadRequestException('name va status majburiy');
    }
    try {
      const course = await this.prisma.course.create({
        data: createCourseDto,
      });
      return { status: 201, message: 'Course created', data: course };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async findAll(query: FindCoursesQueryDto) {
    const { status, search } = query;
    try {
      const courses = await this.prisma.course.findMany({
        where: {
          status: status,
          OR: search ? [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ] : undefined,
        },
        include: {
          _count: {
            select: { groups: true },
          },
        },
      });
      return { status: 200, message: 'success', data: courses };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async findOne(id: string) {
    try {
      const course = await this.prisma.course.findUnique({
        where: { course_id: id },
        include: {
          _count: {
            select: { groups: true },
          },
        },
      });
      if (!course) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }
      return { status: 200, message: 'success', data: course };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    try {
      const exist = await this.prisma.course.findUnique({ where: { course_id: id } });
      if (!exist) throw new NotFoundException(`Course with ID ${id} not found`);
      const updated = await this.prisma.course.update({
        where: { course_id: id },
        data: updateCourseDto,
      });
      return { status: 200, message: 'Course updated', data: updated };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async remove(id: string) {
    try {
      const exist = await this.prisma.course.findUnique({ where: { course_id: id } });
      if (!exist) throw new NotFoundException(`Course with ID ${id} not found`);
      await this.prisma.course.delete({ where: { course_id: id } });
      return { status: 200, message: 'Course deleted' };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getCourseGroups(id: string) {
    try {
      const exist = await this.prisma.course.findUnique({ where: { course_id: id } });
      if (!exist) throw new NotFoundException(`Course with ID ${id} not found`);
      const groups = await this.prisma.groups.findMany({
        where: { course_id: id },
        include: {
          _count: {
            select: { group_members: true },
          },
        },
      });
      return { status: 200, message: 'success', data: groups };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
