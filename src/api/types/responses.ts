/**
 * @fileoverview Typy odpowiedzi API
 */

/**
 * Bazowa odpowiedź API
 */
export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiErrorResponse {
  data: null;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

/**
 * Odpowiedź z paginacją
 */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Odpowiedź sukcesu bez danych
 */
export interface SuccessResponse {
  success: true;
  message?: string;
}
