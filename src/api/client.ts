/**
 * @fileoverview API Client z obsługą błędów i interceptorami
 */

import { supabase } from '@/lib/supabase';
import { logger } from '@/shared/utils/logger';

/**
 * Typy błędów API
 */
export const ApiErrorType = {
  NETWORK: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
} as const;

export type ApiErrorTypeValue = typeof ApiErrorType[keyof typeof ApiErrorType];

/**
 * Klasa błędu API
 */
export class ApiError extends Error {
  type: ApiErrorTypeValue;
  statusCode?: number;
  originalError?: unknown;

  constructor(
    type: ApiErrorTypeValue,
    message: string,
    statusCode?: number,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Obsługa błędów Supabase
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  // Błąd Supabase
  if (error && typeof error === 'object' && 'message' in error) {
    const supabaseError = error as { message: string; code?: string; status?: number };
    
    logger.error('API Error:', supabaseError);

    // Mapowanie kodów błędów Supabase
    const status = supabaseError.status;
    
    switch (status) {
      case 401:
        return new ApiError(
          'UNAUTHORIZED' as ApiErrorTypeValue,
          'Unauthorized - please log in',
          401,
          supabaseError
        );
      case 403:
        return new ApiError(
          'FORBIDDEN' as ApiErrorTypeValue,
          'Access forbidden',
          403,
          supabaseError
        );
      case 404:
        return new ApiError(
          'NOT_FOUND' as ApiErrorTypeValue,
          'Resource not found',
          404,
          supabaseError
        );
      case 500:
      case 502:
      case 503:
        return new ApiError(
          'SERVER' as ApiErrorTypeValue,
          'Server error - please try again later',
          status,
          supabaseError
        );
      default:
        return new ApiError(
          'VALIDATION' as ApiErrorTypeValue,
          supabaseError.message || 'An error occurred',
          status,
          supabaseError
        );
    }
  }

  // Błąd sieci
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new ApiError(
      'NETWORK_ERROR' as ApiErrorTypeValue,
      'Błąd połączenia z serwerem. Sprawdź swoje połączenie internetowe',
      undefined,
      error
    );
  }

  // Nieznany błąd
  logger.error('Unknown error:', error);
  return new ApiError(
    'UNKNOWN_ERROR' as ApiErrorTypeValue,
    'Wystąpił nieoczekiwany błąd',
    undefined,
    error
  );
}

/**
 * API Client - wrapper dla Supabase z obsługą błędów
 */
export const apiClient = {
  /**
   * Bezpieczne wykonanie zapytania z obsługą błędów
   */
  async execute<T>(
    operation: () => Promise<{ data: T | null; error: unknown }>
  ): Promise<T> {
    try {
      const { data, error } = await operation();

      if (error) {
        throw handleApiError(error);
      }

      if (data === null) {
        throw new ApiError(
          'NOT_FOUND' as ApiErrorTypeValue,
          'Brak danych'
        );
      }

      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Pobierz aktualną sesję użytkownika
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw handleApiError(error);
    return data.session;
  },

  /**
   * Pobierz aktualnego użytkownika
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw handleApiError(error);
    return data.user;
  },
};
