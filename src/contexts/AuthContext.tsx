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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Błąd pobierania danych użytkownika:', error);
      return null;
    }

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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSupabaseUser(session.user);
          const userData = await fetchUserData(session.user.id);
          setUser(userData);
        }
      } catch (error) {
        console.error('Błąd inicjalizacji auth:', error);
      } finally {
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
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
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
            password_hash: 'managed_by_supabase_auth', // Hasło zarządzane przez Supabase Auth
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
        // Jeśli nie udało się dodać do users, usuń z auth
        await supabase.auth.admin.deleteUser(data.user.id);
        return { success: false, error: 'Błąd podczas tworzenia profilu użytkownika' };
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
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
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
