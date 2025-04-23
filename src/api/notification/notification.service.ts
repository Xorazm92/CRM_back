import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(user_id: string, message: string, type: string = 'SYSTEM') {
    return this.prisma.notification.create({
      data: {
        user_id,
        message,
        type: type as any,
      },
    });
  }

  async findByUser(user_id: string) {
    return this.prisma.notification.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });
  }

  async delete(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }
}
