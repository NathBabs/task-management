import { PaginatedResponse } from './paginated-response.type';

export type ApiResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

export type PaginatedApiResponse<T> = ApiResponse<PaginatedResponse<T>>;
