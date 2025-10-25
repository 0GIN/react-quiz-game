/**
 * @fileoverview Loading fallback component
 */

import { Spinner } from '@shared/ui';

interface LoadingFallbackProps {
  message?: string;
}

/**
 * Fallback UI dla lazy loaded components
 */
export default function LoadingFallback({ message = 'Ładowanie...' }: LoadingFallbackProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      gap: '16px',
    }}>
      <Spinner size="xl" />
      
      <p style={{
        color: '#00E5FF',
        fontSize: '18px',
        fontWeight: 600,
      }}>
        {message}
      </p>
    </div>
  );
}
