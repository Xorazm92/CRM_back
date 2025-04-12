// user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prismaService.user.create({
      data: {
        ...createUserDto,
        role: createUserDto.role as UserRole || UserRole.STUDENT
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
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prismaService.user.update({
      where: { user_id: id },
      data: {
        ...updateUserDto,
        role: updateUserDto.role as UserRole
      },
    });
  }

  async remove(id: string) {
    return this.prismaService.user.delete({
      where: { user_id: id },
    });
  }
}