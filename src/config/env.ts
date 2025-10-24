/**
 * @fileoverview Konfiguracja zmiennych środowiskowych
 * 
 * Centralizuje dostęp do zmiennych środowiskowych z walidacją.
 * Zapobiega błędom runtime wynikającym z brakujących zmiennych.
 * 
 * @module config/env
 */

/**
 * Pobiera zmienną środowiskową z walidacją
 * @throws {Error} Gdy zmienna nie istnieje
 */
function getEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Brak zmiennej środowiskowej: ${key}. Sprawdź plik .env`);
  }
  return value;
}

/**
 * Konfiguracja Supabase
 */
export const supabaseConfig = {
  url: getEnvVar('VITE_SUPABASE_URL'),
  anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
} as const;

/**
 * Konfiguracja aplikacji
 */
export const appConfig = {
  /**
   * Tryb development (true) lub production (false)
   */
  isDevelopment: import.meta.env.DEV,
  
  /**
   * Tryb production
   */
  isProduction: import.meta.env.PROD,
  
  /**
   * URL bazowy aplikacji
   */
  baseUrl: import.meta.env.BASE_URL || '/',
} as const;

/**
 * Konfiguracja gry
 */
export const gameConfig = {
  /**
   * Domyślna liczba pytań w grze Blitz
   */
  defaultQuestionsCount: 20,
  
  /**
   * Liczba żyć w trybie Blitz
   */
  blitzLives: 3,
  
  /**
   * Punkty za poprawną odpowiedź
   */
  pointsPerCorrectAnswer: 10,
  
  /**
   * XP za każde pytanie
   */
  xpPerQuestion: 10,
  
  /**
   * XP bonus za poprawną odpowiedź
   */
  xpPerCorrectAnswer: 15,
} as const;

/**
 * Konfiguracja poziomów
 */
export const levelConfig = {
  /**
   * Bazowa ilość XP wymagana do poziomu 2
   */
  baseXP: 100,
  
  /**
   * Mnożnik XP dla kolejnych poziomów (exponential)
   */
  xpMultiplier: 1.5,
} as const;
