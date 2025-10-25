/**
 * @fileoverview Komponent ochrony tras tylko dla gości (niezalogowanych)
 * 
 * Wrapper dla route'ów dostępnych tylko dla niezalogowanych użytkowników
 * (strony logowania i rejestracji).
 * 
 * Funkcjonalność:
 * - Sprawdza czy użytkownik NIE jest zalogowany
 * - Przekierowuje zalogowanych do strony głównej (/)
 * - Pokazuje loader podczas ładowania stanu autentykacji
 * 
 * Użycie:
 * ```tsx
 * <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
 * ```
 * 
 * @component
 */

import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@features/auth';

interface GuestRouteProps {
  children: ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        color: '#00E5FF',
        fontSize: '20px'
      }}>
        ⏳ Ładowanie...
      </div>
    );
  }

  // Jeśli zalogowany - przekieruj do strony głównej
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
