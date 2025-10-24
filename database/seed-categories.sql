-- ========================================
-- SEED: Categories
-- Dodaje podstawowe kategorie pytań
-- ========================================

-- Usuń istniejące kategorie (jeśli są)
DELETE FROM categories;

-- Reset sekwencji ID
ALTER SEQUENCE categories_id_seq RESTART WITH 1;

-- Dodaj kategorie
INSERT INTO categories (name, icon_emoji, description, is_active) VALUES
  ('Historia', '📜', 'Pytania o historię świata', true),
  ('Geografia', '🌍', 'Pytania o geografię i miejsca na świecie', true),
  ('Nauka', '🔬', 'Pytania z zakresu nauki i technologii', true),
  ('Sport', '⚽', 'Pytania o sport i sportowców', true),
  ('Kultura', '🎭', 'Pytania o kulturę, sztukę i rozrywkę', true),
  ('Przyroda', '🌿', 'Pytania o przyrodę i zwierzęta', true),
  ('Technologia', '💻', 'Pytania o technologie i innowacje', true),
  ('Matematyka', '🔢', 'Pytania matematyczne i logiczne', true);

-- Sprawdź co zostało dodane
SELECT * FROM categories ORDER BY id;
