import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Pager } from '../pagination/page';

@Injectable()
export class BaseService<T> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly modelName: string
  ) {}

  async findAll(page = 1, limit = 10): Promise<IResponsePagination<T>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma[this.modelName].findMany({
        skip,
        take: limit,
      }),
      this.prisma[this.modelName].count(),
    ]);

    return Pager.of(
      data,
      total,
      limit,
      page,
      200,
      'Data retrieved successfully'
    );
  }

  async findOne(id: string): Promise<T> {
    const item = await this.prisma[this.modelName].findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`${this.modelName} with ID ${id} not found`);
    }

    return item;
  }

  async create(data: any): Promise<T> {
    return this.prisma[this.modelName].create({
      data,
    });
  }

  async update(id: string, data: any): Promise<T> {
    await this.findOne(id);
    return this.prisma[this.modelName].update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<T> {
    await this.findOne(id);
    return this.prisma[this.modelName].delete({
      where: { id },
    });
  }
}