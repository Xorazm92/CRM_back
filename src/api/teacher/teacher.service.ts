import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt/bcrypt';

@Injectable()
export class TeacherService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createTeacherDto: CreateTeacherDto) {
    if (!createTeacherDto.username || !createTeacherDto.password || !createTeacherDto.full_name) {
      throw new BadRequestException('username, password va full_name majburiy');
    }
    // Duplicate username check
    const currentTeacher = await this.prismaService.user.findUnique({ where: { username: createTeacherDto.username } });
    if (currentTeacher) {
      throw new ConflictException('A user with this username already exists');
    }
    createTeacherDto.password = await BcryptEncryption.hashPassword(createTeacherDto.password);
    try {
      const teacher = await this.prismaService.user.create({
        data: {
          ...createTeacherDto,
          role: 'TEACHER',
        },
        select: {
          user_id: true,
          username: true,
          full_name: true,
          role: true,
        },
      });
      return { status: 201, message: 'Teacher created', data: teacher };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    try {
      const [total, teachers] = await Promise.all([
        this.prismaService.user.count({ where: { role: 'TEACHER' } }),
        this.prismaService.user.findMany({
          where: { role: 'TEACHER' },
          take: limit,
          skip: skip,
          select: { user_id: true, full_name: true, username: true, role: true },
        }),
      ]);
      return {
        status: HttpStatus.OK,
        message: 'success',
        data: teachers,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getProfile(id: string) {
    try {
      const teacher = await this.prismaService.user.findUnique({
        where: { user_id: id, role: 'TEACHER' },
        select: { user_id: true, full_name: true, username: true, role: true },
      });
      if (!teacher) throw new NotFoundException(`Teacher not found`);
      return { status: HttpStatus.OK, message: 'success', data: teacher };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async findOne(id: string) {
    try {
      const teacher = await this.prismaService.user.findUnique({
        where: { user_id: id, role: 'TEACHER' },
        select: { user_id: true, full_name: true, username: true, role: true },
      });
      if (!teacher) {
        throw new NotFoundException(`Teacher with id ${id} not found.`);
      }
      return { status: HttpStatus.OK, message: 'success', data: teacher };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    try {
      const currentTeacher = await this.prismaService.user.findUnique({
        where: { user_id: id, role: 'TEACHER' },
      });
      if (!currentTeacher) {
        throw new NotFoundException(`Teacher with id ${id} not found.`);
      }
      const updated = await this.prismaService.user.update({
        where: { user_id: id },
        data: { full_name: updateTeacherDto.full_name },
        select: { user_id: true, full_name: true, username: true, role: true },
      });
      return { status: HttpStatus.OK, message: 'Teacher updated', data: updated };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async remove(id: string) {
    try {
      const currentTeacher = await this.prismaService.user.findUnique({
        where: { user_id: id, role: 'TEACHER' },
      });
      if (!currentTeacher) {
        throw new NotFoundException(`Teacher with id ${id} not found.`);
      }
      await this.prismaService.user.delete({ where: { user_id: id } });
      return { status: HttpStatus.OK, message: 'Teacher deleted' };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getTeacherGroups(id: string) {
    // O'qituvchining ma'lumotlari
    const teacher = await this.prismaService.user.findUnique({
      where: { user_id: id, role: 'TEACHER' },
      select: { user_id: true, full_name: true }
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    // O'qituvchi a'zo bo'lgan guruhlar
    const groups = await this.prismaService.groupMembers.findMany({
      where: { user_id: id },
      include: {
        group: true
      }
    });
    return {
      teacher_id: teacher.user_id,
      full_name: teacher.full_name,
      groups: groups.map(gm => ({
        group_id: gm.group.group_id,
        name: gm.group.name,
        course_id: gm.group.course_id,
        description: gm.group.description,
        status: gm.group.status
      }))
    };
  }
}
