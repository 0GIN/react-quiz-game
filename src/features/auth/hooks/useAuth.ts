/**
 * @fileoverview useAuth hook - wrapper dla AuthContext
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook do zarządzania autentykacją
 * 
 * @throws {Error} Jeśli użyty poza AuthProvider
 * @returns AuthContext value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}
