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
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

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

    console.log('✅ Dane użytkownika z bazy:', data);
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
    const initializeAuth = async () => {
      try {
        console.log('🔄 Inicjalizacja AuthContext...');
        console.log('📡 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        
        // Timeout dla getSession (max 5 sekund)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: getSession() trwa zbyt długo')), 5000)
        );
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        console.log('✅ Sesja pobrana:', session ? 'istnieje' : 'brak');
        
        if (session?.user) {
          setSupabaseUser(session.user);
          console.log('👤 Pobieram dane użytkownika...');
          const userData = await fetchUserData(session.user.id);
          console.log('✅ Dane użytkownika pobrane:', userData?.username);
          setUser(userData);
        }
      } catch (error) {
        console.error('❌ Błąd inicjalizacji auth:', error);
      } finally {
        console.log('✅ AuthContext gotowy (loading = false)');
        setLoading(false);
      }
    };

    initializeAuth();

    // Nasłuchiwanie zmian w sesji
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (session?.user) {
        setSupabaseUser(session.user);
        const userData = await fetchUserData(session.user.id);
        setUser(userData);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const userData = await fetchUserData(data.user.id);
        setUser(userData);
        setSupabaseUser(data.user);
        
        // Aktualizuj last_login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Nieoczekiwany błąd podczas logowania' };
    }
  };

  // Funkcja rejestracji
  const register = async (username: string, email: string, password: string) => {
    try {
      // 1. Sprawdź czy username jest zajęty
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username);

      if (checkError && checkError.code !== 'PGRST116') {
        return { success: false, error: 'Błąd sprawdzania nazwy użytkownika' };
      }

      if (existingUsers && existingUsers.length > 0) {
        return { success: false, error: 'Ta nazwa użytkownika jest już zajęta' };
      }

      // 2. Zarejestruj w Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Nie udało się utworzyć konta' };
      }

      // 3. Utwórz rekord w tabeli users
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            username,
            email,
            password_hash: 'managed_by_supabase_auth',
            avatar_url: 'guest_avatar.png',
            flash_points: 0,
            level: 1,
            experience: 0,
            experience_to_next_level: 100,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        return { success: false, error: `Błąd podczas tworzenia profilu: ${insertError.message}` };
      }

      // 4. Pobierz dane użytkownika
      const userData = await fetchUserData(data.user.id);
      setUser(userData);
      setSupabaseUser(data.user);

      return { success: true };
    } catch (error) {
      console.error('Błąd rejestracji:', error);
      return { success: false, error: 'Nieoczekiwany błąd podczas rejestracji' };
    }
  };

  // Funkcja wylogowania
  const logout = async () => {
    console.log('🚪 Wykonuję logout w AuthContext...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Błąd signOut:', error);
        throw error;
      }
      console.log('✅ Supabase signOut zakończony');
      setUser(null);
      setSupabaseUser(null);
      console.log('✅ User i SupabaseUser ustawione na null');
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
