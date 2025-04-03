import { IResponsePagination } from 'src/common/interface';

export class Pager<T> {
  public static of<T>(
    data: Array<T>,
    total_elements: number,
    page_size: number,
    current_page: number,
    status_code: number,
    message: string,
  ): IResponsePagination<T> {
    const from = (current_page - 1) * page_size + 1;
    const to = current_page * page_size;
    return new Pager(
      data,
      total_elements,
      Math.ceil(total_elements / page_size),
      page_size,
      current_page,
      from,
      to,
      status_code,
      message,
    ).toPage();
  }

  private constructor(
    private data: Array<T>,
    private total_elements: number,
    private total_pages: number,
    private page_size: number,
    private current_page: number,
    private from: number,
    private to: number,
    private status_code: number,
    private message: string,
  ) {}

  public toPage(): IResponsePagination<T> {
    return {
      data: this.data,
      total_elements: this.total_elements,
      total_pages: this.total_pages,
      page_size: this.page_size,
      current_page: this.current_page,
      from: this.from > this.total_elements ? this.total_elements : this.from,
      to: this.to > this.total_elements ? this.total_elements : this.to,
      status_code: this.status_code,
      message: this.message,
    };
  }
}
