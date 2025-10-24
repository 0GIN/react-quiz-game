-- ========================================
-- SEED: Game Modes
-- Dodaje podstawowe tryby gry
-- ========================================

-- Usuń istniejące tryby (jeśli są)
DELETE FROM game_modes;

-- Reset sekwencji ID
ALTER SEQUENCE game_modes_id_seq RESTART WITH 1;

-- Dodaj tryby gry
INSERT INTO game_modes (code, name, description, min_players, max_players, time_limit_seconds, lives_count, requires_category, is_active) VALUES
  ('duel', 'Duel', '1v1 - Kto jest lepszy?', 2, 2, 15, 3, false, true),
  ('squad', 'Squad', '2v2 drużynowa dominacja', 4, 4, 15, 3, false, true),
  ('blitz', 'Blitz', '3 życia i walka na czas', 1, 1, 30, 3, false, true),
  ('master', 'Master', 'Sprawdź się w pojedynku z jednej kategorii', 2, 2, 20, 3, true, true);

-- Sprawdź co zostało dodane
SELECT * FROM game_modes ORDER BY id;
