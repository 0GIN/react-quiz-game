/* eslint-disable react-refresh/only-export-components */

/**
 * @fileoverview Kontekst autentykacji użytkowników
 * 
 * Ten kontekst odpowiada za:
 * - Zarządzanie stanem uwierzytelnienia użytkownika (logged in/guest)
 * - Przechowywanie danych użytkownika z tabeli users (profil, statystyki, poziom, punkty)
 * - Funkcje logowania, rejestracji i wylogowania
 * - Automatyczne odświeżanie sesji i danych użytkownika
 * - Sprawdzanie ról użytkownika (guest, user, admin)
 * - Integrację z Supabase Auth
 * 
 * Użycie:
 * ```tsx
 * const { user, isGuest, isAdmin, login, logout } = useAuth();
 * ```
 * 
 * Role:
 * - isGuest: Niezalogowany użytkownik (tylko demo)
 * - isUser: Zalogowany zwykły użytkownik
 * - isAdmin: Zalogowany administrator (pełne uprawnienia)
 * 
 * @module contexts/AuthContext
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  flash_points: number;
  level: number;
  experience: number;
  experience_to_next_level: number;
  total_games_played: number;
  total_wins: number;
  total_losses: number;
  total_correct_answers: number;
  total_questions_answered: number;
  current_streak: number;
  best_streak: number;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  isGuest: boolean;
  isUser: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const normalizeUsername = (raw: string) => raw.trim();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUsernameAvailability = async (username: string): Promise<
    | { ok: false; error: string }
    | { ok: true; username: string }
  > => {
    const sanitized = normalizeUsername(username);
    if (!USERNAME_REGEX.test(sanitized)) {
      return {
        ok: false,
        error: 'Nazwa użytkownika może zawierać tylko litery, cyfry oraz „_” (3-20 znaków).'
      };
    }

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', sanitized)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Błąd sprawdzania nazwy użytkownika:', error);
      return {
        ok: false,
        error: 'Nie udało się sprawdzić dostępności nazwy użytkownika.'
      };
    }

    if (data?.id) {
      return { ok: false, error: 'Ta nazwa użytkownika jest już zajęta.' };
    }

    return { ok: true, username: sanitized };
  };

  const checkEmailAvailability = async (email: string): Promise<
    | { ok: false; error: string }
    | { ok: true; email: string }
  > => {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmed)) {
      return {
        ok: false,
        error: 'Podaj poprawny adres email.',
      };
    }

    const { data: userByEmail, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', trimmed)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Błąd sprawdzania email:', error);
      return {
        ok: false,
        error: 'Nie udało się sprawdzić dostępności emaila. Spróbuj ponownie później.',
      };
    }

    if (userByEmail?.id) {
      return {
        ok: false,
        error: 'Istnieje już konto z tym adresem email. Spróbuj się zalogować lub użyj innego adresu.',
      };
    }

    return { ok: true, email: trimmed };
  };

  const waitForUserRow = async (userId: string, attempts = 10, delayMs = 200) => {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (data?.id) {
        return true;
      }

      await sleep(delayMs);
    }

    return false;
  };

  const ensureAuxiliaryRecords = async (
    userId: string,
    username: string,
    email?: string | null,
  ) => {
    try {
      const profileBase = {
        display_name: username,
        avatar_url: 'guest_avatar.png',
        bio: '',
        show_stats: true,
        show_achievements: true,
        allow_friend_requests: true,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...profileBase,
        }, { onConflict: 'user_id' });

      if (profileError?.code === '42703') {
        await supabase
          .from('user_profiles')
          .upsert({
            id: userId,
            ...profileBase,
          }, { onConflict: 'id' });
      } else if (profileError) {
        console.warn('⚠️ Nie udało się utworzyć profilu użytkownika:', profileError);
      }

      const { error: statsError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          username,
        }, { onConflict: 'user_id' });

      if (statsError?.code === '42703') {
        await supabase
          .from('user_stats')
          .upsert({
            id: userId,
            username,
          }, { onConflict: 'id' });
      } else if (statsError) {
        console.warn('⚠️ Nie udało się utworzyć statystyk użytkownika:', statsError);
      }

      if (email) {
        await supabase
          .from('users')
          .update({ email })
          .eq('id', userId);
      }
    } catch (error) {
      console.warn('⚠️ ensureAuxiliaryRecords – błąd pomocniczy:', error);
    }
  };

  // Funkcja pobierająca dane użytkownika z tabeli users
  const fetchUserData = async (userId: string) => {
    console.log('📥 fetchUserData dla userId:', userId);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Błąd pobierania danych użytkownika:', error);
      return null;
    }

    if (!data) {
      console.error('❌ Brak danych użytkownika w users dla userId:', userId);
      return null;
    }

    console.log('✅ Dane użytkownika z bazy:', data);
    
    // Tabela users ma już wszystkie potrzebne kolumny
    return data as User;
  };

  // Odświeżanie danych użytkownika
  const refreshUser = async () => {
    if (supabaseUser) {
      const userData = await fetchUserData(supabaseUser.id);
      setUser(userData);
    }
  };

  // Sprawdzenie sesji przy załadowaniu
  useEffect(() => {
    // Natychmiast ustaw loading=false żeby nie blokować UI
    setLoading(false);
    
    // Sprawdź sesję w tle (asynchronicznie)
    const checkSession = async () => {
      try {
        console.log('🔄 Sprawdzam sesję w tle...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('✅ Sesja sprawdzona:', session ? 'istnieje' : 'brak');
        
        if (session?.user) {
          setSupabaseUser(session.user);
          const userData = await fetchUserData(session.user.id);
          if (userData) {
            setUser(userData);
            console.log('✅ Użytkownik załadowany z sesji');
          }

          const resolvedUsername = userData?.username
            || (session.user.user_metadata as { username?: string } | null)?.username
            || session.user.email?.split('@')[0]
            || 'user';

          await ensureAuxiliaryRecords(session.user.id, resolvedUsername, session.user.email);
        }
      } catch (error) {
        console.error('❌ Błąd sprawdzania sesji:', error);
      }
    };
    
    // Uruchom w tle bez blokowania
    checkSession();

    // Nasłuchiwanie zmian w sesji
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (session?.user) {
        setSupabaseUser(session.user);
        const userData = await fetchUserData(session.user.id);
        setUser(userData);

        const resolvedUsername = userData?.username
          || (session.user.user_metadata as { username?: string } | null)?.username
          || session.user.email?.split('@')[0]
          || 'user';

        await ensureAuxiliaryRecords(session.user.id, resolvedUsername, session.user.email);
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Funkcja logowania
  const login = async (email: string, password: string) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      console.log('🔑 Próba logowania:', trimmedEmail);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        console.error('❌ Błąd logowania Supabase:', error);
        const friendlyMessage = error.message === 'Invalid login credentials'
          ? 'Nieprawidłowy email lub hasło. Jeśli dopiero założyłeś konto, upewnij się, że potwierdziłeś adres email.'
          : error.message;
        return { success: false, error: friendlyMessage };
      }

      if (data.user) {
        console.log('✅ Zalogowano do Supabase, user_id:', data.user.id);
        setSupabaseUser(data.user);
        
        const userData = await fetchUserData(data.user.id);
        console.log('📊 Pobrane dane użytkownika:', userData);

        const resolvedUsername = userData?.username
          || (data.user.user_metadata as { username?: string } | null)?.username
          || data.user.email?.split('@')[0]
          || 'user';

  await ensureAuxiliaryRecords(data.user.id, resolvedUsername, trimmedEmail);
        
        if (userData) {
          setUser(userData);
          console.log('✅ User ustawiony w state');
        } else {
          console.error('⚠️ fetchUserData zwróciło null!');
          // Ustaw minimalny user object żeby nie blokować logowania
          setUser({
            id: data.user.id,
            username: resolvedUsername,
            email: data.user.email || '',
            avatar_url: '',
            flash_points: 0,
            level: 1,
            experience: 0,
            experience_to_next_level: 100,
            total_games_played: 0,
            total_wins: 0,
            total_losses: 0,
            total_correct_answers: 0,
            total_questions_answered: 0,
            current_streak: 0,
            best_streak: 0,
            is_admin: false,
          });
        }
        
        // Aktualizuj last_login w users
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Nieoczekiwany błąd logowania:', error);
      return { success: false, error: 'Nieoczekiwany błąd podczas logowania' };
    }
  };

  // Funkcja rejestracji
  const register = async (username: string, email: string, password: string) => {
    try {
      const availability = await checkUsernameAvailability(username);
      if (!availability.ok) {
        return { success: false, error: availability.error };
      }

      const sanitizedUsername = availability.username;
      const emailCheck = await checkEmailAvailability(email);
      if (!emailCheck.ok) {
        return { success: false, error: emailCheck.error };
      }

      const trimmedEmail = emailCheck.email;

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      });

      if (error) {
        const friendlyMessage = error.message === 'Database error saving new user'
          ? 'Nie udało się zapisać konta w bazie. Jeśli masz już konto z tym adresem email, spróbuj się zalogować lub użyj innego adresu. W razie potrzeby usuń duplikat w tabeli users.'
          : error.message;
        console.error('❌ Supabase signUp error:', error);
        return { success: false, error: friendlyMessage };
      }

      const authUser = data.user;

      if (!authUser) {
        return {
          success: false,
          error: 'Konto zostało utworzone, ale wymaga weryfikacji email. Sprawdź skrzynkę i spróbuj zalogować się po potwierdzeniu.',
        };
      }

      const userRowAvailable = await waitForUserRow(authUser.id, 20, 250);

      if (!userRowAvailable) {
        console.error('❌ Nie udało się odnaleźć rekordu użytkownika w tabeli users');
        return {
          success: false,
          error: 'Nie udało się zakończyć rejestracji. Spróbuj ponownie za chwilę.',
        };
      }

      const timestamp = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: sanitizedUsername,
          email: trimmedEmail,
          created_at: timestamp,
          last_login: timestamp,
        })
        .eq('id', authUser.id);

      if (updateError) {
        console.warn('⚠️ Nie udało się zaktualizować profilu użytkownika:', updateError);
      }

      await ensureAuxiliaryRecords(authUser.id, sanitizedUsername, trimmedEmail);

      const userData = await fetchUserData(authUser.id);

      if (userData) {
        setUser(userData);
      }

      setSupabaseUser(authUser);

      if (!data.session) {
        return {
          success: true,
          requiresVerification: true,
          message: 'Konto utworzono. Sprawdź pocztę i potwierdź email, a następnie zaloguj się.',
        };
      }

      return {
        success: true,
        message: 'Konto zostało utworzone i zalogowane.',
      };
    } catch (error) {
      console.error('Błąd rejestracji:', error);
      return { success: false, error: 'Nieoczekiwany błąd podczas rejestracji' };
    }
  };

  // Funkcja wylogowania
  const logout = async () => {
    console.log('🚪 Wykonuję logout w AuthContext...');
    try {
      // Najpierw wyczyść stan lokalnie
      setUser(null);
      setSupabaseUser(null);
      console.log('✅ User i SupabaseUser ustawione na null');
      
      // Potem wywołaj signOut
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Błąd signOut:', error);
        throw error;
      }
      console.log('✅ Supabase signOut zakończony');
    } catch (error) {
      console.error('❌ Błąd w logout():', error);
      throw error;
    }
  };

  // Role użytkownika
  const isGuest = !user; // Niezalogowany
  const isUser = !!user && !user.is_admin; // Zalogowany zwykły użytkownik
  const isAdmin = !!user && user.is_admin; // Zalogowany admin

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser, 
      loading, 
      isGuest, 
      isUser, 
      isAdmin,
      login, 
      register, 
      logout, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook do używania AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
