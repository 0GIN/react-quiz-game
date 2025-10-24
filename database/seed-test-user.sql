-- Skrypt do dodania testowego użytkownika
-- UWAGA: Ten skrypt zakłada, że użytkownik został NAJPIERW utworzony w Supabase Auth
-- (np. przez panel administracyjny lub poprzez rejestrację w aplikacji)

-- Jeśli chcesz dodać użytkownika testowego:
-- 1. Utwórz konto w Supabase Auth Dashboard lub przez formularz rejestracji
-- 2. Skopiuj UUID użytkownika z auth.users
-- 3. Uruchom poniższy skrypt, zastępując 'USER_ID_FROM_AUTH' rzeczywistym UUID

-- Przykład: Dodanie testowego użytkownika z danymi do gry

-- KROK 1: Sprawdź czy użytkownik istnieje w auth.users
-- SELECT id, email FROM auth.users WHERE email = 'test@example.com';

-- KROK 2: Jeśli użytkownik istnieje, dodaj/zaktualizuj jego profil
INSERT INTO public.users (
  id,
  username,
  email,
  avatar_url,
  flash_points,
  level,
  experience,
  experience_to_next_level,
  total_games_played,
  total_wins,
  total_losses,
  total_correct_answers,
  total_questions_answered,
  current_streak,
  best_streak,
  is_admin,
  created_at,
  last_login
)
VALUES (
  'USER_ID_FROM_AUTH', -- Zamień na prawdziwy UUID z auth.users
  'TestPlayer',
  'test@example.com',
  'guest_avatar.png',
  500, -- Flash Points
  5,   -- Level
  250, -- Experience
  400, -- XP do następnego poziomu
  10,  -- Zagrane gry
  6,   -- Wygrane
  4,   -- Przegrane
  85,  -- Poprawne odpowiedzi
  100, -- Wszystkie odpowiedzi
  3,   -- Aktualny streak
  5,   -- Najlepszy streak
  false, -- Czy admin
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  flash_points = EXCLUDED.flash_points,
  level = EXCLUDED.level,
  experience = EXCLUDED.experience,
  total_games_played = EXCLUDED.total_games_played,
  total_wins = EXCLUDED.total_wins,
  total_losses = EXCLUDED.total_losses,
  total_correct_answers = EXCLUDED.total_correct_answers,
  total_questions_answered = EXCLUDED.total_questions_answered,
  current_streak = EXCLUDED.current_streak,
  best_streak = EXCLUDED.best_streak;

-- ALTERNATYWNIE: Użyj danych z twojego prawdziwego konta
-- Jeśli już zarejestrowałeś oginski@op.pl w aplikacji:

-- Sprawdź ID użytkownika:
-- SELECT id, email FROM auth.users WHERE email = 'oginski@op.pl';

-- Zaktualizuj profil (zamień UUID poniżej):
-- UPDATE public.users
-- SET 
--   username = 'Oginski',
--   flash_points = 500,
--   level = 3,
--   experience = 150,
--   total_games_played = 5
-- WHERE id = 'TWOJE_UUID_Z_AUTH_USERS';

-- Jeśli chcesz SZYBKO dodać użytkownika testowego przez SQL:
-- (wymaga rozszerzenia pgcrypto dla funkcji crypt)

-- UWAGA: To NIE jest zalecane w produkcji!
-- Lepiej użyj Supabase Auth API lub dashboard

/*
-- Najpierw wstaw do auth.users (wymaga uprawnień superuser):
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'pro@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  ''
);

-- Następnie pobierz ID i zaktualizuj users (jak wyżej)
*/

COMMENT ON TABLE public.users IS 'Tabela profilów użytkowników synchronizowana z auth.users przez trigger handle_new_user()';
