/**
 * @fileoverview useDebounce hook
 */

import { useState, useEffect } from 'react';

/**
 * Hook do debounce wartości
 * Przydatny np. w search inputach
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
