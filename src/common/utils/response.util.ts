import { ApiResponse } from '../types/api-response.type';

export function formatResponse<T>(
  data: T,
  message: string,
  status: boolean = true,
): ApiResponse<T> {
  return {
    status,
    message,
    data,
  };
}
