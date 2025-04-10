
import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt/bcrypt';

@Injectable()
export class TeacherService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createTeacherDto: CreateTeacherDto) {
    const currentTeacher = await this.prismaService.user.findUnique({
      where: { username: createTeacherDto.username },
    });
    if (currentTeacher) {
      throw new ConflictException('A user with this username already exists');
    }
    createTeacherDto.password = await BcryptEncryption.hashPassword(
      createTeacherDto.password,
    );
    const teacher = await this.prismaService.user.create({
      data: { ...createTeacherDto, role: 'TEACHER' },
    });
    return {
      status: HttpStatus.CREATED,
      message: 'created',
      data: teacher,
    };
  }

  async findAll(page: number, limit: number) {
    page = (page - 1) * limit;
    const teachers = await this.prismaService.user.findMany({
      where: { role: 'TEACHER' },
      take: limit,
      skip: page,
    });
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
      where: { user_id: id, role: 'TEACHER' },
    });
    if (!currentTeacher) {
      throw new NotFoundException(`Teacher with id ${id} not found.`);
    }
    await this.prismaService.user.update({
      where: { user_id: id },
      data: { full_name: updateTeacherDto.full_name },
    });
    return {
      status: HttpStatus.OK,
      message: 'success',
    };
  }

  async remove(id: string) {
    const currentTeacher = await this.prismaService.user.findUnique({
      where: { user_id: id, role: 'TEACHER' },
    });
    if (!currentTeacher) {
      throw new NotFoundException(`Teacher with id ${id} not found.`);
    }
    await this.prismaService.user.delete({ where: { user_id: id } });
    return {
      status: HttpStatus.OK,
      message: 'success',
    };
  }
}
