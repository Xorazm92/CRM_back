import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class SettingService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.setting.findMany({ select: { key: true, value: true } });
  }

  async getOne(key: string) {
    return this.prisma.setting.findUnique({ where: { key } });
  }

  async update(key: string, value: string) {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException('Setting not found');
    return this.prisma.setting.update({ where: { key }, data: { value } });
  }

  async create(key: string, value: string) {
    return this.prisma.setting.create({ data: { key, value } });
  }

  async remove(key: string) {
    return this.prisma.setting.delete({ where: { key } });
  }
}
