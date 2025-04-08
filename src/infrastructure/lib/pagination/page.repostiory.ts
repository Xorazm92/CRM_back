import { FindManyOptions, ObjectLiteral, Repository } from 'typeorm';
import { Pager } from './';
import { IFindOptions, IResponsePagination } from 'src/common/interface';

export class RepositoryPager {
  public static readonly DEFAULT_PAGE = 1;
  public static readonly DEFAULT_PAGE_SIZE = 10;

  public static async findAll<T extends ObjectLiteral>(
    repository: Repository<T>,
    message: string,
    options?: IFindOptions<T>,
  ): Promise<IResponsePagination<T>> {
    const [data, count] = await repository.findAndCount(
      RepositoryPager.normalizePagination(options),
    );
    return Pager.of(
      data,
      count,
      options?.take ?? this.DEFAULT_PAGE_SIZE,
      options?.skip ?? this.DEFAULT_PAGE,
      200,
      message,
    );
  }

  private static normalizePagination<T>(
    options?: IFindOptions<T>,
  ): FindManyOptions<T> {
    const page = (options?.skip ?? RepositoryPager.DEFAULT_PAGE) - 1; // pagination is 1 indexed, convert into 0 indexed
    return {
      ...options,
      take: options?.take,
      skip: page * (options?.take ?? RepositoryPager.DEFAULT_PAGE_SIZE),
    };
  }
}
