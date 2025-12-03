-- =============================================
-- DODATKOWE OSIĄGNIĘCIA
-- Rozszerzenie systemu osiągnięć o nowe wyzwania
-- =============================================

-- Dodaj nowe osiągnięcia do tabeli achievements
-- Używamy struktury: code, name, description, icon_emoji, requirement_type, requirement_value, flash_points_reward
INSERT INTO achievements (code, name, description, icon_emoji, requirement_type, requirement_value, flash_points_reward) VALUES
-- Rozgrywki
('games_10', 'Nowicjusz', 'Rozegraj 10 gier', '🎮', 'total_games', 10, 50),
('games_100', 'Weteran', 'Rozegraj 100 gier', '🎯', 'total_games', 100, 200),
('games_500', 'Legenda', 'Rozegraj 500 gier', '👑', 'total_games', 500, 1000),
('games_1000', 'Mistrz Gier', 'Rozegraj 1000 gier', '🏅', 'total_games', 1000, 2500),

-- Zwycięstwa
('win_1', 'Pierwsza Wygrana', 'Wygraj swoją pierwszą grę', '🥇', 'total_wins', 1, 100),
('win_25', 'Zdobywca', 'Wygraj 25 gier', '🏆', 'total_wins', 25, 300),
('win_100', 'Champion', 'Wygraj 100 gier', '👑', 'total_wins', 100, 1000),
('win_250', 'Niezwyciężony', 'Wygraj 250 gier', '⭐', 'total_wins', 250, 2500),

-- Serie zwycięstw
('streak_3', 'Na fali', 'Wygraj 3 gry pod rząd', '🔥', 'streak', 3, 150),
('streak_5', 'Gorąca passa', 'Wygraj 5 gier pod rząd', '🔥🔥', 'streak', 5, 300),
('streak_10', 'Niepokonany', 'Wygraj 10 gier pod rząd', '🔥🔥🔥', 'streak', 10, 1000),

-- Społeczność
('friends_5', 'Przyjaciel', 'Dodaj 5 znajomych', '👥', 'friends_count', 5, 100),
('friends_25', 'Towarzyski', 'Dodaj 25 znajomych', '🤝', 'friends_count', 25, 500),
('friends_50', 'Popularny', 'Dodaj 50 znajomych', '🌟', 'friends_count', 50, 1500),

-- Duele
('duel_10', 'Duelista', 'Wygraj 10 dueli', '⚔️', 'duel_wins', 10, 200),
('duel_50', 'Mistrz Dueli', 'Wygraj 50 dueli', '⚔️⚔️', 'duel_wins', 50, 1000),

-- Squad
('squad_5', 'Gracz Zespołowy', 'Wygraj 5 meczy Squad', '👥', 'squad_wins', 5, 250),
('squad_25', 'Dowódca Squad', 'Wygraj 25 meczy Squad', '🎖️', 'squad_wins', 25, 1250),

-- Nauka
('correct_100', 'Student', 'Odpowiedz poprawnie na 100 pytań', '📚', 'correct_answers', 100, 200),
('correct_500', 'Mądrale', 'Odpowiedz poprawnie na 500 pytań', '🧠', 'correct_answers', 500, 1000),
('correct_1000', 'Geniusz', 'Odpowiedz poprawnie na 1000 pytań', '🎓', 'correct_answers', 1000, 2500),

-- Specjalne
('night_owl', 'Nocny Marek', 'Zagraj o 3:00 w nocy', '🌙', 'special', 1, 500),
('early_bird', 'Wczesny Ptaszek', 'Zagraj o 6:00 rano', '🌅', 'special', 1, 500),
('perfect_game', 'Perfekcja', 'Wygraj grę z 100% poprawnością', '💯', 'special', 1, 1000),
('fast_answer', 'Szybki jak błyskawica', 'Odpowiedz na pytanie w mniej niż 2 sekundy', '⚡', 'special', 1, 300),
('shopaholic', 'Kolekcjoner', 'Kup 10 przedmiotów w sklepie', '🛒', 'items_bought', 10, 500),
('rich', 'Bogaty', 'Zgromadź 10000 Flash Points', '💰', 'flash_points', 10000, 2000);

-- Dodaj kolumnę banner_url do tabeli users (jeśli nie istnieje)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='banner_url') THEN
        ALTER TABLE users ADD COLUMN banner_url TEXT DEFAULT NULL;
    END IF;
END $$;

-- Dodaj kilka predefiniowanych banerów do wyboru
CREATE TABLE IF NOT EXISTS banner_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    unlock_requirement TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wstaw przykładowe banery
INSERT INTO banner_templates (name, image_url, category, is_premium, unlock_requirement) VALUES
('Gradient Niebieski', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'gradient', false, NULL),
('Gradient Zielony', 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)', 'gradient', false, NULL),
('Gradient Fioletowy', 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', 'gradient', false, NULL),
('Gradient Różowy', 'linear-gradient(135deg, #FF6B95 0%, #FF3D63 100%)', 'gradient', false, NULL),
('Gradient Pomarańczowy', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 'gradient', false, NULL),
('Gradient Turkusowy', 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)', 'gradient', false, NULL),
('Gradient Złoty', 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', 'gradient', true, 'level_10'),
('Gradient Tęczowy', 'linear-gradient(135deg, #ff0000 0%, #ff7f00 20%, #ffff00 40%, #00ff00 60%, #0000ff 80%, #8b00ff 100%)', 'gradient', true, 'achievement_50'),
('Gwiazdy', 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 1px, transparent 1px), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', 'pattern', false, NULL),
('Neon Grid', 'linear-gradient(90deg, rgba(0,229,255,0.1) 1px, transparent 1px), linear-gradient(rgba(0,229,255,0.1) 1px, transparent 1px), linear-gradient(135deg, #0A0A1A 0%, #1a1a2e 100%)', 'pattern', true, 'level_25');

-- Enable RLS
ALTER TABLE banner_templates ENABLE ROW LEVEL SECURITY;

-- Policy: wszyscy mogą czytać
CREATE POLICY "Anyone can view banner templates"
    ON banner_templates FOR SELECT
    USING (true);
