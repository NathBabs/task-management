export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};
