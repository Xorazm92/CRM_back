import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { BcryptEncryption } from '../../infrastructure/lib/bcrypt';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    try {
      if (!dto.username || !dto.password || !dto.name || !dto.lastname) {
        throw new BadRequestException('username, password, name va lastname majburiy');
      }
      // Duplicate username check
      const existing = await this.prisma.user.findUnique({ where: { username: dto.username } });
      if (existing) {
        throw new BadRequestException('A user with this username already exists');
      }
      const hashedPassword = await BcryptEncryption.hashPassword(dto.password);
      const student = await this.prisma.user.create({
        data: {
          username: dto.username,
          password: hashedPassword,
          name: dto.name,
          lastname: dto.lastname,
          middlename: dto.middlename,
          birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
          gender: dto.gender ? dto.gender.toUpperCase() as any : undefined,
          address: dto.address,
          payment: dto.payment,
          phone_number: dto.phone_number,
          role: 'STUDENT'
        },
        select: {
          user_id: true,
          username: true,
          name: true,
          lastname: true,
          middlename: true,
          birthdate: true,
          gender: true,
          address: true,
          payment: true,
          phone_number: true,
          role: true
        }
      });
      return { status: 201, message: 'Student created', data: student };
    } catch (e) {
      console.error('Student create error:', e);
      throw new InternalServerErrorException(e.message);
    }
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    try {
      const [total, students] = await Promise.all([
        this.prisma.user.count({ where: { role: 'STUDENT' } }),
        this.prisma.user.findMany({
          where: { role: 'STUDENT' },
          skip,
          take: limit,
          select: {
            user_id: true,
            username: true,
            name: true,
            lastname: true,
            middlename: true,
            birthdate: true,
            gender: true,
            address: true,
            payment: true,
            phone_number: true,
            role: true
          }
        })
      ]);
      return {
        status: 200,
        message: 'success',
        data: students,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async findOne(id: string) {
    try {
      const student = await this.prisma.user.findUnique({
        where: { user_id: id, role: 'STUDENT' },
        select: {
          user_id: true,
          username: true,
          name: true,
          lastname: true,
          middlename: true,
          birthdate: true,
          gender: true,
          address: true,
          payment: true,
          phone_number: true,
          role: true
        }
      });
      if (!student) throw new NotFoundException(`Student not found`);
      return { status: 200, message: 'success', data: student };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    try {
      const student = await this.prisma.user.update({
        where: { user_id: id },
        data: {
          name: updateStudentDto.name,
          lastname: updateStudentDto.lastname,
          middlename: updateStudentDto.middlename,
          birthdate: updateStudentDto.birthdate ? new Date(updateStudentDto.birthdate) : undefined,
          gender: updateStudentDto.gender ? updateStudentDto.gender.toUpperCase() as any : undefined,
          address: updateStudentDto.address,
          payment: updateStudentDto.payment,
          phone_number: updateStudentDto.phone_number,
        },
        select: {
          user_id: true,
          username: true,
          name: true,
          lastname: true,
          middlename: true,
          birthdate: true,
          gender: true,
          address: true,
          payment: true,
          phone_number: true,
          role: true
        }
      });
      if (!student) throw new NotFoundException(`Student not found`);
      return { status: 200, message: 'Student updated', data: student };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async remove(id: string) {
    try {
      const student = await this.prisma.user.delete({ where: { user_id: id } });
      if (!student) throw new NotFoundException(`Student not found`);
      return { status: 200, message: 'Student deleted' };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getProfile(id: string) {
    try {
      const student = await this.prisma.user.findUnique({
        where: { user_id: id, role: 'STUDENT' },
        select: {
          user_id: true,
          username: true,
          name: true,
          lastname: true,
          middlename: true,
          birthdate: true,
          gender: true,
          address: true,
          payment: true,
          phone_number: true,
          role: true
        }
      });
      if (!student) throw new NotFoundException(`Student not found`);
      return { status: 200, message: 'success', data: student };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}