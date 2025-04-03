import { HttpException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IFindOptions } from 'src/common/interface';
import { RepositoryPager } from 'src/infrastructure/lib/pagination';

export class BaseService<CreateDto, Entity> {
  constructor(private readonly repository: Repository<any>) {}

  get getRepository() {
    return this.repository;
  }

  async create(dto: CreateDto) {
    let created_data = this.repository.create({
      ...dto,
    }) as unknown as Entity;
    created_data = await this.repository.save(created_data);
    return {
      status_code: 201,
      message: 'sucess',
      data: created_data,
    };
  }

  async findAll(options?: IFindOptions<Entity>) {
    const data = (await this.repository.find({
      ...options,
    })) as Entity[];
    return {
      status_code: 200,
      message: 'success',
      data: data,
    };
  }

  async findAllWithPagination(options?: IFindOptions<Entity>) {
    return await RepositoryPager.findAll(
      this.getRepository,
      'success',
      options,
    );
  }

  async findOneBy(options: IFindOptions<Entity>) {
    const data = (await this.repository.findOne({
      select: options.select || {},
      relations: options.relations || [],
      where: options.where,
    })) as Entity;
    if (!data) {
      throw new HttpException('not found', 404);
    }
    return {
      status_code: 200,
      message: 'success',
      data: data,
    };
  }

  async findOneById(id: string, options?: IFindOptions<Entity>) {
    const data = (await this.repository.findOne({
      select: options?.select || {},
      relations: options?.relations || [],
      where: { id, ...options?.where },
    })) as unknown as Entity;
    if (!data) {
      throw new HttpException('not found', 404);
    }
    return {
      status_code: 200,
      message: 'success',
      data,
    };
  }

  async updateProfile(id: string, dto: Partial<CreateDto>) {
    await this.findOneById(id);
    await this.repository.update(id, {
      ...dto,
      updated_at: Date.now(),
    });
    return {
      status_code: 200,
      message: 'success',
      data: {},
    };
  }

  async delete(id: string) {
    await this.findOneById(id);
    (await this.repository.delete(id)) as unknown as Entity;
    return {
      status_code: 200,
      message: 'success',
      data: {},
    };
  }
}
