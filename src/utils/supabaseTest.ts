/**
 * @fileoverview Tester połączenia z Supabase
 * 
 * Prosty skrypt do weryfikacji czy połączenie z Supabase działa poprawnie.
 * Uruchom w komponencie aby przetestować.
 * 
 * @module utils/supabaseTest
 */

import { supabase } from '../lib/supabase';

/**
 * Testuje połączenie z Supabase
 * Wyświetla wyniki w konsoli
 */
export async function testSupabaseConnection() {
  console.log('🧪 Testowanie połączenia z Supabase...\n');

  try {
    // Test 1: Sprawdź czy klient został utworzony
    console.log('✅ Klient Supabase utworzony');
    console.log('📡 URL:', import.meta.env.VITE_SUPABASE_URL);

    // Test 2: Sprawdź połączenie z bazą (proste query)
    console.log('\n🔍 Sprawdzam połączenie z bazą...');
    const { data, error } = await supabase
      .from('questions')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Błąd połączenia:', error.message);
      console.error('💡 Sprawdź:');
      console.error('   - Czy tabela "questions" istnieje w bazie?');
      console.error('   - Czy RLS policies są poprawnie skonfigurowane?');
      console.error('   - Czy wykonałeś skrypty SQL z folderu database/?');
      return false;
    }

    console.log('✅ Połączenie z bazą działa!');
    console.log('📊 Znaleziono rekordów:', data?.length || 0);

    // Test 3: Sprawdź sesję auth
    console.log('\n🔐 Sprawdzam sesję autentykacji...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error('❌ Błąd sprawdzania sesji:', authError.message);
      return false;
    }

    if (session) {
      console.log('✅ Użytkownik zalogowany:', session.user.email);
    } else {
      console.log('ℹ️ Brak aktywnej sesji (użytkownik niezalogowany)');
    }

    console.log('\n✨ Wszystkie testy zakończone pomyślnie!');
    return true;

  } catch (err) {
    console.error('❌ Nieoczekiwany błąd:', err);
    console.error('\n💡 Upewnij się że:');
    console.error('   1. Plik .env istnieje i zawiera poprawne dane');
    console.error('   2. VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY są ustawione');
    console.error('   3. Zrestartowałeś dev server (npm run dev)');
    return false;
  }
}

/**
 * Hook React do testowania połączenia przy montowaniu komponentu
 */
export function useSupabaseTest() {
  // Możesz użyć w komponencie:
  // useEffect(() => {
  //   testSupabaseConnection();
  // }, []);
}
