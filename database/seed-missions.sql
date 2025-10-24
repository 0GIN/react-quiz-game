-- ========================================
-- Przykładowe Codzienne Misje
-- Dodaj te misje do bazy danych w Supabase SQL Editor
-- ========================================

-- Wstaw misje na dziś
INSERT INTO daily_missions (name, description, mission_type, target_value, flash_points_reward, experience_reward, valid_date, is_active) VALUES
('Wygraj 3 pojedynki', 'Zdobądź 3 zwycięstwa w trybie Duel', 'win_games', 3, 50, 100, CURRENT_DATE, true),
('Odpowiedz na 10 pytań z geografii', 'Zagraj pytania z kategorii Geografia', 'answer_category', 10, 30, 50, CURRENT_DATE, true),
('Ukończ 1 pojedynek bezbłędnie', 'Wygraj grę bez żadnej błędnej odpowiedzi', 'perfect_game', 1, 100, 200, CURRENT_DATE, true),
('Zagraj 5 gier', 'Rozegraj 5 dowolnych gier', 'play_games', 5, 40, 80, CURRENT_DATE, true),
('Zdobądź 500 FlashPoints', 'Zbierz 500 FP w ciągu dnia', 'earn_flash_points', 500, 75, 150, CURRENT_DATE, true);

-- Sprawdź dodane misje
SELECT * FROM daily_missions WHERE valid_date = CURRENT_DATE ORDER BY id;
