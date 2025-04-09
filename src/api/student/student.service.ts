import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt/bcrypt';

@Injectable()
export class StudentService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createStudentDto: CreateStudentDto) {
    const currentStudent = await this.prismaService.user.findUnique({
      where: { username: createStudentDto.username },
    });
    if (currentStudent) {
      throw new ConflictException('A user with this username already exists');
    }
    createStudentDto.password = await BcryptEncryption.hashPassword(
      createStudentDto.password,
    );
    const student = await this.prismaService.user.create({
      data: { ...createStudentDto, role: 'STUDENT' },
    });
    return {
      status: HttpStatus.CREATED,
      message: 'created',
      data: student,
    };
  }

  async findAll() {
    const students = await this.prismaService.user.findMany({
      where: { role: 'STUDENT' },
    });
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: students,
    };
  }
  async getProfile(id: string) {
    const student = await this.prismaService.user.findUnique({
      where: { user_id: id, role: 'STUDENT' },
      select: { user_id: true, full_name: true, username: true , role:true },
    });
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: student,
    };
  }

  async findOne(id: string) {
    const student = await this.prismaService.user.findUnique({
      where: { user_id: id },
    });
    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found.`);
    }
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: student,
    };
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const currentStudent = await this.prismaService.user.findUnique({
      where: { user_id: id },
    });
    if (!currentStudent) {
      throw new NotFoundException(`Student with id ${id} not found.`);
    }
    await this.prismaService.user.update({
      where: { user_id: id },
      data: { full_name: updateStudentDto.full_name },
    });
    return {
      status: HttpStatus.OK,
      message: 'success',
    };
  }

  async remove(id: string) {
    const currentStudent = await this.prismaService.user.findUnique({
      where: { user_id: id },
    });
    if (!currentStudent) {
      throw new NotFoundException(`Student with id ${id} not found.`);
    }
    await this.prismaService.user.delete({ where: { user_id: id } });
    return {
      status: HttpStatus.OK,
      message: 'success',
    };
  }
}
