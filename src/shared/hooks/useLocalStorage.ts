/**
 * @fileoverview useLocalStorage hook
 */

import { useState, useEffect } from 'react';
import { logger } from '@shared/utils';

/**
 * Hook do przechowywania stanu w localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Inicjalizacja z localStorage lub fallback do initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Funkcja do zapisywania wartości
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Obsługa funkcji callback (jak w useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      logger.error('Error saving to localStorage:', error);
    }
  };

  // Synchronizacja między tabami
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          logger.error('Error syncing localStorage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}
