-- Enable Realtime for messages and friendships tables
-- Run this in Supabase SQL Editor

-- 1. Dodaj tabelę messages do publikacji realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 2. Dodaj tabelę friendships do publikacji realtime
ALTER PUBLICATION supabase_realtime ADD TABLE friendships;

-- 3. Sprawdź czy zostały dodane
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Powinno pokazać:
-- public | messages
-- public | friendships
-- (oraz inne tabele jeśli już były włączone)
