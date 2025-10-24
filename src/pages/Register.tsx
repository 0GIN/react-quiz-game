/**
 * @fileoverview Strona rejestracji nowego użytkownika
 * 
 * Formularz rejestracji z integracją Supabase Auth i tworzeniem profilu.
 * 
 * Funkcjonalność:
 * - Walidacja wszystkich pól (username, email, hasło, potwierdzenie)
 * - Sprawdzanie unikalności nazwy użytkownika
 * - Tworzenie konta w Supabase Auth
 * - Automatyczne tworzenie profilu w tabeli users
 * - Inicjalizacja statystyk użytkownika
 * - Przekierowanie po rejestracji
 * 
 * Walidacje:
 * - Username min. 3 znaki
 * - Hasło min. 6 znaków
 * - Zgodność haseł
 * - Poprawny format email
 * 
 * Zabezpieczenia:
 * - Dostępna tylko dla niezalogowanych (GuestRoute)
 * - Sprawdzanie zajętości username przed rejestracją
 * - Obsługa błędów z API
 * 
 * @page
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Walidacja
    if (!username || !email || !password || !confirmPassword) {
      setError('Wypełnij wszystkie pola');
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError('Nazwa użytkownika musi mieć minimum 3 znaki');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Hasło musi mieć minimum 6 znaków');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne');
      setLoading(false);
      return;
    }

    const result = await register(username, email, password);

    if (result.success) {
      navigate('/'); // Przekieruj na stronę główną
    } else {
      setError(result.error || 'Błąd podczas rejestracji');
    }

    setLoading(false);
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
          <Card className="register-page">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>🎯 Zarejestruj się</h2>
              <p className="page-subtitle">
                Dołącz do społeczności QuizRush!
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
                  👤 Nazwa użytkownika
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ProGamer123"
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

              <div style={{ marginBottom: '20px' }}>
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

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#E0E0E0', 
                  marginBottom: '8px',
                  fontWeight: 600,
                  fontSize: '14px'
                }}>
                  🔒 Potwierdź hasło
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? '⏳ Tworzenie konta...' : '🚀 Zarejestruj się'}
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
                Masz już konto?
              </p>
              <Link
                to="/login"
                className="btn secondary"
                style={{
                  display: 'inline-block',
                  textDecoration: 'none',
                  padding: '10px 24px'
                }}
              >
                🔑 Zaloguj się
              </Link>
            </div>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(0,229,255,0.05)',
              borderRadius: '8px',
              borderLeft: '3px solid #00E5FF'
            }}>
              <p style={{ color: '#00E5FF', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                ℹ️ Informacje:
              </p>
              <ul style={{ color: '#B8B8D0', fontSize: '12px', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
                <li>Nazwa użytkownika: minimum 3 znaki</li>
                <li>Hasło: minimum 6 znaków</li>
                <li>Zaczynasz z 0 FlashPoints na poziomie 1</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
