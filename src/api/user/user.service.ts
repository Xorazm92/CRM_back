// user.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';
import { Gender, UserRole } from '@prisma/client';
import { UserStatus } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Duplicate username check
    const existing = await this.prismaService.user.findUnique({ where: { username: createUserDto.username } });
    if (existing) {
      throw new BadRequestException('A user with this username already exists');
    }
    if (createUserDto.email) {
      const emailExist = await this.prismaService.user.findFirst({ where: { email: createUserDto.email as any } });
      if (emailExist) {
        throw new BadRequestException('A user with this email already exists');
      }
    }
    // Password hash
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    // birthdate oddiy formatda kelsa, ISO formatga o'gir va Date obyektiga aylantir
    let birthdate: Date | undefined = undefined;
    if (typeof createUserDto.birthdate === 'string') {
      let raw = createUserDto.birthdate;
      if (raw.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        raw = raw + 'T00:00:00.000Z';
      }
      birthdate = new Date(raw);
    } else if (createUserDto.birthdate instanceof Date) {
      birthdate = createUserDto.birthdate;
    }
    return this.prismaService.user.create({
      data: {
        username: createUserDto.username,
        password: hashedPassword,
        name: createUserDto.name,
        lastname: createUserDto.lastname,
        middlename: createUserDto.middlename,
        birthdate: birthdate,
        gender: createUserDto.gender,
        address: createUserDto.address,
        phone_number: createUserDto.phone_number,
        role: createUserDto.role || UserRole.STUDENT,
        // status fieldni olib tashlash, agar modelda yo'q bo'lsa
        // status: createUserDto.status || UserStatus.ACTIVE,
      },
    });
  }

  async findAll() {
    return this.prismaService.user.findMany({
      include: {
        attendances: true,
        group_members: true,
        gradedSubmissions: true,
        submissions: true,
        assignments: true,
        student_payments: true,
        groups_as_teacher: true,
        discounts: true,
        notifications: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { user_id: id },
      include: {
        attendances: true,
        group_members: true,
        gradedSubmissions: true,
        submissions: true,
        assignments: true,
        student_payments: true,
        groups_as_teacher: true,
        discounts: true,
        notifications: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Email unique check
    if (updateUserDto.email) {
      const emailExist = await this.prismaService.user.findFirst({
        where: {
          email: updateUserDto.email as any,
          NOT: { user_id: id },
        },
      });
      if (emailExist) {
        throw new BadRequestException('A user with this email already exists');
      }
    }
    // Password hash if updating
    let updateData = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return this.prismaService.user.update({
      where: { user_id: id },
      data: updateData,
    });
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.prismaService.user.findUnique({ where: { user_id: id } });
    if (!user) throw new NotFoundException('User not found');
    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prismaService.user.update({ where: { user_id: id }, data: { password: hashed } });
    return { message: 'Password changed successfully' };
  }

  async filterUsers(role?: string, status?: string, search?: string, page = 1, limit = 10) {
    const allowedRoles = ['ADMIN', 'MANAGER', 'TEACHER', 'STUDENT'];
    const allowedStatus = ['ACTIVE', 'INACTIVE', 'BLOCKED'];
    const where: any = {};
    if (role) {
      if (!allowedRoles.includes(role)) {
        throw new BadRequestException(`role must be one of: ${allowedRoles.join(', ')}`);
      }
      where.role = role;
    }
    if (status) {
      if (!allowedStatus.includes(status)) {
        throw new BadRequestException(`status must be one of: ${allowedStatus.join(', ')}`);
      }
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { lastname: { contains: search, mode: 'insensitive' } },
        { middlename: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone_number: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.user.count({ where }),
    ]);
    return { data, total };
  }

  // Username orqali userni topish uchun universal metod
  async findOneByUsername(username: string) {
    return this.prismaService.user.findUnique({ where: { username } });
  }

  async remove(id: string) {
    return this.prismaService.user.delete({
      where: { user_id: id },
    });
  }
}