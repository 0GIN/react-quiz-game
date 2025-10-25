/**
 * @fileoverview Utility do warunkowego logowania
 * 
 * Centralizuje logowanie w aplikacji i umożliwia jego wyłączenie w produkcji.
 * Używaj tego zamiast bezpośrednich wywołań console.log/error/warn.
 * 
 * @module utils/logger
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Logger z poziomami logowania warunkowego
 */
export const logger = {
  /**
   * Logowanie informacyjne (tylko w trybie development)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Logowanie błędów (zawsze aktywne)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Logowanie ostrzeżeń (tylko w trybie development)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Logowanie informacji debugowych (tylko w trybie development)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Grupowanie logów (tylko w trybie development)
   */
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label);
    }
  },

  /**
   * Zakończenie grupy logów (tylko w trybie development)
   */
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },
};
