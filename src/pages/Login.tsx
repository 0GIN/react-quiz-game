/**
 * @fileoverview Strona logowania
 * 
 * Formularz logowania użytkownika z integracją Supabase Auth.
 * 
 * Funkcjonalność:
 * - Walidacja pól (email, hasło)
 * - Integracja z AuthContext.login()
 * - Wyświetlanie błędów logowania
 * - Auto-przekierowanie po zalogowaniu (przez GuestRoute)
 * - Link do strony rejestracji
 * - Stan ładowania podczas procesu logowania
 * 
 * Zabezpieczenia:
 * - Dostępna tylko dla niezalogowanych (GuestRoute)
 * - Walidacja przed wysłaniem
 * - Obsługa błędów z API
 * 
 * @page
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();

  console.log('🔍 Login.tsx - user:', user ? user.username : 'null');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Walidacja
    if (!email || !password) {
      setError('Wypełnij wszystkie pola');
      setLoading(false);
      return;
    }

    console.log('🔐 Próba logowania...');
    const result = await login(email, password);
    console.log('📊 Wynik logowania:', result);

    if (result.success) {
      console.log('✅ Logowanie udane - czekam na aktualizację user w kontekście');
      // GuestRoute automatycznie przekieruje gdy user się ustawi
    } else {
      setError(result.error || 'Nieprawidłowy email lub hasło');
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <div style={{ 
        gridColumn: 'span 12', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '70vh'
      }}>
        <div style={{ maxWidth: '450px', width: '100%' }}>
          <Card className="login-page">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>🎮 Zaloguj się</h2>
              <p className="page-subtitle">
                Witaj z powrotem w QuizRush!
              </p>
            </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                color: '#E0E0E0', 
                marginBottom: '8px',
                fontWeight: 600,
                fontSize: '14px'
              }}>
                📧 Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(184, 184, 208, 0.2)',
                  borderRadius: '8px',
                  color: '#E0E0E0',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00E5FF'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(184, 184, 208, 0.2)'}
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                color: '#E0E0E0', 
                marginBottom: '8px',
                fontWeight: 600,
                fontSize: '14px'
              }}>
                🔒 Hasło
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(184, 184, 208, 0.2)',
                  borderRadius: '8px',
                  color: '#E0E0E0',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00E5FF'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(184, 184, 208, 0.2)'}
                disabled={loading}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(255, 59, 48, 0.1)',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                borderRadius: '8px',
                color: '#FF3B30',
                fontSize: '14px',
                marginBottom: '20px'
              }}>
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 600,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '⏳ Logowanie...' : '🚀 Zaloguj się'}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: 'rgba(0,229,255,0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(0,229,255,0.2)',
            textAlign: 'center'
          }}>
            <p style={{ color: '#B8B8D0', fontSize: '14px', marginBottom: '12px' }}>
              Nie masz jeszcze konta?
            </p>
            <Link
              to="/register"
              className="btn secondary"
              style={{
                display: 'inline-block',
                textDecoration: 'none',
                padding: '10px 24px'
              }}
            >
              📝 Zarejestruj się
            </Link>
          </div>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(255,215,0,0.05)',
            borderRadius: '8px',
            borderLeft: '3px solid #FFD700'
          }}>
            <p style={{ color: '#FFD700', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
              💡 Dane testowe:
            </p>
            <p style={{ color: '#B8B8D0', fontSize: '12px', lineHeight: 1.6 }}>
              Email: <code style={{ color: '#00E5FF' }}>pro@example.com</code><br />
              Hasło: <code style={{ color: '#00E5FF' }}>password123</code>
            </p>
          </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
