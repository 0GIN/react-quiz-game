-- ========================================
-- DROP ALL TABLES - Reset Database
-- ========================================
-- UWAGA: To usunie WSZYSTKIE dane!
-- Użyj tylko jeśli chcesz zacząć od nowa.
-- ========================================

-- Wyłącz RLS przed usunięciem
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shop_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_daily_missions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_missions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS friendships DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS game_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS game_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS game_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS games DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS game_modes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

-- Usuń tabele w odpowiedniej kolejności (od zależnych do głównych)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_purchases CASCADE;
DROP TABLE IF EXISTS shop_items CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS user_daily_missions CASCADE;
DROP TABLE IF EXISTS daily_missions CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_participants CASCADE;
DROP TABLE IF EXISTS chat_conversations CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS game_answers CASCADE;
DROP TABLE IF EXISTS game_questions CASCADE;
DROP TABLE IF EXISTS game_participants CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS game_modes CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Usuń rozszerzenie UUID (opcjonalnie)
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- Sprawdź czy wszystko usunięte
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ========================================
-- Gotowe! Teraz możesz uruchomić schema.sql
-- ========================================
