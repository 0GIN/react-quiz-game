-- ========================================
-- 🎨 Aktualizacja kategorii - Material Icons
-- Zamienia emoji na profesjonalne Material Symbols
-- ========================================

UPDATE categories SET icon_emoji = 'history_edu' WHERE name = 'Historia';
UPDATE categories SET icon_emoji = 'public' WHERE name = 'Geografia';
UPDATE categories SET icon_emoji = 'science' WHERE name = 'Nauka';
UPDATE categories SET icon_emoji = 'sports_soccer' WHERE name = 'Sport';
UPDATE categories SET icon_emoji = 'theater_comedy' WHERE name = 'Kultura';
UPDATE categories SET icon_emoji = 'nature' WHERE name = 'Przyroda';
UPDATE categories SET icon_emoji = 'computer' WHERE name = 'Technologia';
UPDATE categories SET icon_emoji = 'calculate' WHERE name = 'Matematyka';

-- Weryfikacja
SELECT 
  name,
  icon_emoji,
  '✅' as status
FROM categories
ORDER BY name;
