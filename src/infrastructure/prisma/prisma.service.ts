import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  teacher: any;
  student: any;
  payment: any;
  async onModuleInit() {
    await this.$connect();
  }

  async $connect() {
    await super.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async $disconnect() {
    await super.$disconnect();
  }
}
