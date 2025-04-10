import {
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt/bcrypt';
import Redis from 'ioredis';

@Injectable()
export class TeacherService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async create(createTeacherDto: CreateTeacherDto) {
    const currentTeacher = await this.prismaService.user.findUnique({
      where: { username: createTeacherDto.username },
    });
    if (currentTeacher) {
      throw new ConflictException('A user with this username already exists');
    }
    createTeacherDto.password = await BcryptEncryption.encrypt(
      createTeacherDto.password,
    );
    const teacher = await this.prismaService.user.create({
      data: { ...createTeacherDto, role: 'TEACHER' },
    });

    // teacher delete from redis
    const keys = await this.redis.keys('teachers:page:*');
    if (keys.length) {
      await this.redis.del(...keys);
    }

    return {
      status: HttpStatus.CREATED,
      message: 'created',
      data: teacher,
    };
  }

  async findAll(page: number, limit: number) {
    const key = `teachers:page:${page}:limit:${limit}`;
    const allTeacher = await this.redis.get(key);
    if (allTeacher) {
      return JSON.parse(allTeacher);
    }
    const skip = (page - 1) * limit;
    const teachers = await this.prismaService.user.findMany({
      where: { role: 'TEACHER' },
      take: limit,
      skip: skip,
    });
    await this.redis.set(key, JSON.stringify(teachers));
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: teachers,
    };
  }
  async getProfile(id: string) {
    const teacher = await this.prismaService.user.findUnique({
      where: { user_id: id, role: 'TEACHER' },
      select: { user_id: true, full_name: true, username: true, role: true },
    });
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: teacher,
    };
  }

  async findOne(id: string) {
    const teacher = await this.prismaService.user.findUnique({
      where: { user_id: id, role: 'TEACHER' },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${id} not found.`);
    }
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: teacher,
    };
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    const currentTeacher = await this.prismaService.user.findUnique({
      where: { user_id: id },
    });
    if (!currentTeacher) {
      throw new NotFoundException(`Teacher with id ${id} not found.`);
    }
    await this.prismaService.user.update({
      where: { user_id: id },
      data: { full_name: updateTeacherDto.full_name },
    });
    // teacher delete from redis
    const keys = await this.redis.keys('teachers:page:*');
    if (keys.length) {
      await this.redis.del(...keys);
    }
    return {
      status: HttpStatus.OK,
      message: 'success',
    };
  }

  async remove(id: string) {
    const currentTeacher = await this.prismaService.user.findUnique({
      where: { user_id: id },
    });
    if (!currentTeacher) {
      throw new NotFoundException(`Teacher with id ${id} not found.`);
    }
    // teacher delete from redis
    const keys = await this.redis.keys('teachers:page:*');
    if (keys.length) {
      await this.redis.del(...keys);
    }
    await this.prismaService.user.delete({ where: { user_id: id } });
    return {
      status: HttpStatus.OK,
      message: 'success',
    };
  }
}
