-- ============================================
-- SEED DANYCH - SKLEP
-- ============================================
-- Przykładowe przedmioty w sklepie:
-- - Avatary (15 sztuk)
-- - Tytuły (20 sztuk)
-- - Odznaki (15 sztuk)
-- - Tła profilu (10 sztuk)
-- - Ramki awatarów (10 sztuk)
-- - Boostery (5 typów)
-- ============================================

-- ============================================
-- AVATARY (category = 'avatar')
-- ============================================
INSERT INTO public.shop_items (category, name, description, image_url, price, rarity) VALUES
-- Common Avatars (50-100 FP)
('avatar', '🎮 Gracz', 'Klasyczny avatar gracza', '/avatars/gamer.png', 50, 'common'),
('avatar', '📚 Mól Książkowy', 'Dla miłośników wiedzy', '/avatars/bookworm.png', 50, 'common'),
('avatar', '🎯 Snajper', 'Celny jak snajper', '/avatars/sniper.png', 75, 'common'),
('avatar', '🌟 Gwiazda', 'Świeć jak gwiazda', '/avatars/star.png', 100, 'common'),

-- Rare Avatars (200-400 FP)
('avatar', '🦅 Orzeł', 'Majestatyczny i potężny', '/avatars/eagle.png', 200, 'rare'),
('avatar', '🔥 Feniks', 'Odradzaj się z popiołów', '/avatars/phoenix.png', 250, 'rare'),
('avatar', '⚡ Błyskawica', 'Szybki jak błyskawica', '/avatars/lightning.png', 300, 'rare'),
('avatar', '🎭 Mistrz Zagadek', 'Enigmatyczny i mądry', '/avatars/riddler.png', 350, 'rare'),

-- Epic Avatars (500-800 FP)
('avatar', '👑 Król Quizów', 'Władca wiedzy', '/avatars/king.png', 500, 'epic'),
('avatar', '🐉 Smok', 'Legendarny i niepokonany', '/avatars/dragon.png', 600, 'epic'),
('avatar', '🌌 Kosmita', 'Z odległych galaktyk', '/avatars/alien.png', 700, 'epic'),

-- Legendary Avatars (1000-2000 FP)
('avatar', '💎 Diament', 'Najrzadszy z najrzadszych', '/avatars/diamond.png', 1000, 'legendary'),
('avatar', '🏆 Champion', 'Mistrz mistrzów', '/avatars/champion.png', 1500, 'legendary'),
('avatar', '🦄 Jednorożec', 'Magiczny i unikalny', '/avatars/unicorn.png', 2000, 'legendary'),
('avatar', '🌈 Tęcza', 'Kolorowy i radosny', '/avatars/rainbow.png', 1200, 'legendary');

-- ============================================
-- TYTUŁY (category = 'title')
-- ============================================
INSERT INTO public.shop_items (category, name, description, price, rarity) VALUES
-- Common Titles (100-200 FP)
('title', 'Początkujący', 'Dopiero zaczynasz swoją przygodę', 100, 'common'),
('title', 'Entuzjasta', 'Kochasz quizy!', 100, 'common'),
('title', 'Dociekliwy', 'Zawsze szukasz odpowiedzi', 150, 'common'),
('title', 'Gracz', 'Typowy gracz quizowy', 150, 'common'),

-- Rare Titles (300-500 FP)
('title', 'Mistrz Wiedzy', 'Twoja wiedza jest imponująca', 300, 'rare'),
('title', 'Błyskotliwy', 'Szybko myślisz', 300, 'rare'),
('title', 'Niepokonany', 'Trudno cię pokonać', 400, 'rare'),
('title', 'Strategista', 'Planujesz każdy ruch', 400, 'rare'),
('title', 'Legenda', 'Twoja sława jest ogromna', 500, 'rare'),

-- Epic Titles (600-1000 FP)
('title', 'Mistrz Quizów', 'Władca wszystkich quizów', 600, 'epic'),
('title', 'Encyklopedia Chodząca', 'Wiesz wszystko!', 700, 'epic'),
('title', 'Genius', 'IQ ponad normę', 800, 'epic'),
('title', 'Profesor', 'Nauczyciel innych graczy', 800, 'epic'),
('title', 'Wielki Mistrz', 'Osiągnąłeś perfekcję', 900, 'epic'),

-- Legendary Titles (1000-2000 FP)
('title', 'Champion Świata', 'Najlepszy na świecie', 1000, 'legendary'),
('title', 'Omniscient', 'Wszechwiedzący', 1200, 'legendary'),
('title', 'Quiz God', 'Bóg quizów', 1500, 'legendary'),
('title', 'The Immortal', 'Nieśmiertelny', 1800, 'legendary'),
('title', 'Ultimate Legend', 'Najwyższa legenda', 2000, 'legendary');

-- ============================================
-- ODZNAKI (category = 'badge')
-- ============================================
INSERT INTO public.shop_items (category, name, description, price, rarity) VALUES
-- Common Badges (200-300 FP)
('badge', 'Pierwsza Wygrana', 'Za pierwszą wygraną grę', 200, 'common'),
('badge', 'Wytrwały', 'Za 100 zagranych gier', 250, 'common'),
('badge', 'Dokładny', '80% accuracy', 250, 'common'),
('badge', 'Szybki', 'Za szybkie odpowiedzi', 300, 'common'),

-- Rare Badges (400-600 FP)
('badge', 'Mistrz Streaku', 'Streak 20+', 400, 'rare'),
('badge', 'Kolekcjoner Punktów', '10,000 Flash Points', 500, 'rare'),
('badge', 'Perfectionist', '100% accuracy', 500, 'rare'),
('badge', 'Wszechstronny', 'Zagraj w każdej kategorii', 600, 'rare'),

-- Epic Badges (700-1000 FP)
('badge', 'Legenda Rankingów', 'Top 10 w rankingu', 700, 'epic'),
('badge', 'Mistrz Kategorii', 'Ekspert w 5 kategoriach', 800, 'epic'),
('badge', 'Niepokonany Wojownik', '100 wygranych z rzędu', 900, 'epic'),

-- Legendary Badges (1000-1500 FP)
('badge', 'Champion', 'Za bycie #1', 1000, 'legendary'),
('badge', 'Quiz Master', 'Za 1000 gier', 1200, 'legendary'),
('badge', 'The Ultimate', 'Za wszystkie osiągnięcia', 1500, 'legendary');

-- ============================================
-- TŁA PROFILU (category = 'background')
-- ============================================
INSERT INTO public.shop_items (category, name, description, image_url, price, rarity) VALUES
('background', 'Ciemna Noc', 'Spokojne ciemne tło', '/backgrounds/dark-night.jpg', 300, 'common'),
('background', 'Niebieski Ocean', 'Kojące niebieskie fale', '/backgrounds/ocean.jpg', 300, 'common'),
('background', 'Las', 'Zielone drzewa', '/backgrounds/forest.jpg', 400, 'common'),
('background', 'Pustynny Zachód', 'Złoty zachód słońca', '/backgrounds/desert.jpg', 500, 'rare'),
('background', 'Kosmos', 'Gwiazdy i galaktyki', '/backgrounds/space.jpg', 700, 'rare'),
('background', 'Neon City', 'Cyberpunkowe miasto', '/backgrounds/neon-city.jpg', 900, 'epic'),
('background', 'Aurora', 'Magiczna zorza', '/backgrounds/aurora.jpg', 1000, 'epic'),
('background', 'Ognisty Feniks', 'Płomienie i popiół', '/backgrounds/phoenix.jpg', 1200, 'epic'),
('background', 'Kraina Fantasy', 'Magiczny świat', '/backgrounds/fantasy.jpg', 1500, 'legendary'),
('background', 'Matrix', 'Zielony kod', '/backgrounds/matrix.jpg', 2000, 'legendary');

-- ============================================
-- RAMKI AWATARÓW (category = 'frame')
-- ============================================
INSERT INTO public.shop_items (category, name, description, image_url, price, rarity) VALUES
('frame', 'Srebrna Ramka', 'Elegancka srebrna obwódka', '/frames/silver.png', 200, 'common'),
('frame', 'Złota Ramka', 'Luksusowa złota obwódka', '/frames/gold.png', 400, 'rare'),
('frame', 'Platynowa Ramka', 'Błyszcząca platynowa ramka', '/frames/platinum.png', 600, 'rare'),
('frame', 'Diamentowa Ramka', 'Brylantowa ramka', '/frames/diamond.png', 1000, 'epic'),
('frame', 'Ognista Ramka', 'Płonąca ramka', '/frames/fire.png', 800, 'epic'),
('frame', 'Lodowa Ramka', 'Mroźna ramka', '/frames/ice.png', 800, 'epic'),
('frame', 'Neonowa Ramka', 'Świecąca neonowa ramka', '/frames/neon.png', 1200, 'epic'),
('frame', 'Kosmiczna Ramka', 'Galaktyczna ramka', '/frames/cosmic.png', 1500, 'legendary'),
('frame', 'Królewska Ramka', 'Ramka dla królów', '/frames/royal.png', 1800, 'legendary'),
('frame', 'Ultimate Ramka', 'Najbardziej epic ramka', '/frames/ultimate.png', 2500, 'legendary');

-- ============================================
-- BOOSTERY (category = 'booster')
-- ============================================
INSERT INTO public.shop_items (category, name, description, price, rarity) VALUES
('booster', '2x XP Boost (1h)', 'Podwaja zdobywane XP przez 1 godzinę', 300, 'common'),
('booster', '2x XP Boost (3h)', 'Podwaja zdobywane XP przez 3 godziny', 700, 'rare'),
('booster', '2x Flash Points (1h)', 'Podwaja zdobywane FP przez 1 godzinę', 400, 'common'),
('booster', 'Extra Życie (Blitz)', 'Dodatkowe życie w trybie Blitz', 500, 'rare'),
('booster', 'Mega Boost (2h)', '2x XP i 2x FP przez 2 godziny', 1000, 'epic');

-- ============================================
-- SUKCES!
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Dodano przykładowe przedmioty do sklepu:';
  RAISE NOTICE '   - 15 Avatarów (50-2000 FP)';
  RAISE NOTICE '   - 20 Tytułów (100-2000 FP)';
  RAISE NOTICE '   - 15 Odznak (200-1500 FP)';
  RAISE NOTICE '   - 10 Teł profilu (300-2000 FP)';
  RAISE NOTICE '   - 10 Ramek awatarów (200-2500 FP)';
  RAISE NOTICE '   - 5 Boosterów (300-1000 FP)';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Sklep jest gotowy do użycia!';
END $$;
