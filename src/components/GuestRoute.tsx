import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
