/**
 * @fileoverview Error Boundary component
 */

import { Component, type ReactNode } from 'react';
import { logger } from '@shared/utils';
import { Button } from '@shared/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary - łapie błędy React i wyświetla fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '32px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '24px',
          }}>
            ⚠️
          </div>
          
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#FF3D71',
            marginBottom: '16px',
          }}>
            Coś poszło nie tak
          </h2>
          
          <p style={{
            fontSize: '16px',
            color: '#B8C1EC',
            marginBottom: '32px',
            maxWidth: '500px',
          }}>
            Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę lub skontaktuj się z administratorem.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              background: '#232946',
              padding: '16px',
              borderRadius: '8px',
              color: '#FF3D71',
              fontSize: '14px',
              textAlign: 'left',
              overflow: 'auto',
              maxWidth: '600px',
              marginBottom: '24px',
            }}>
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          )}

          <div style={{ display: 'flex', gap: '16px' }}>
            <Button onClick={this.handleReset}>
              Spróbuj ponownie
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => window.location.href = '/'}
            >
              Wróć do strony głównej
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
