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
    createTeacherDto.password = await BcryptEncryption.encrypt(
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

  async findAll() {
    const teachers = await this.prismaService.user.findMany({where: {role : 'TEACHER'}});
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: teachers,
    };
  }

  async findOne(id: string) {
    const teacher = await this.prismaService.user.findUnique({
      where: { user_id: id , role: 'TEACHER'},
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
    await this.prismaService.user.delete({ where: { user_id: id } });
    return {
      status: HttpStatus.OK,
      message: 'success',
    };
  }
}
