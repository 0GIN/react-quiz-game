/**
 * @fileoverview Konfiguracja klienta Supabase
 * 
 * Singleton Supabase client dla całej aplikacji.
 * Używany do:
 * - Autentykacji użytkowników
 * - Operacji na bazie danych (CRUD)
 * - Real-time subscriptions
 * - Storage (przyszłość: avatary, pliki)
 * 
 * @module lib/supabase
 */

import { createClient } from '@supabase/supabase-js'

// Pobierz zmienne środowiskowe
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Walidacja
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Brak zmiennych środowiskowych Supabase!\n\n' +
    'Utwórz plik .env w głównym katalogu projektu:\n' +
    'VITE_SUPABASE_URL=https://twoj-projekt.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=twoj-anon-key\n\n' +
    'Dane znajdziesz w: Supabase Dashboard → Settings → API'
  )
}

/**
 * Singleton Supabase client
 * Używaj tego w całej aplikacji zamiast tworzyć nowe instancje
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
