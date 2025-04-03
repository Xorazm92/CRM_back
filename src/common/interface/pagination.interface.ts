export interface Page<T> {
  data: Array<T>;
  total_elements: number;
  total_pages: number;
  page_size: number;
}

type customQueryOptionsDetails = {
  query: string;
  parameters: any[];
};

export interface findAllCustomQueryOptions {
  data: customQueryOptionsDetails;
  count: customQueryOptionsDetails;
  take: number | undefined;
}
