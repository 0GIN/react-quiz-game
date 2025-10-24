import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();

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

  // Jeśli niezalogowany - przekieruj do logowania
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jeśli wymaga admina, ale użytkownik nie jest adminem
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
