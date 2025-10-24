-- ========================================
-- Testowe Statystyki Użytkowników
-- Dodaj realistyczne dane do testów
-- ========================================

-- Zaktualizuj statystyki dla istniejących użytkowników testowych
-- ProGamer123
UPDATE users 
SET 
  total_games_played = 245,
  total_wins = 189,
  total_losses = 56,
  total_questions_answered = 2450,
  total_correct_answers = 2156,
  current_streak = 8,
  best_streak = 15,
  flash_points = 9200,
  experience = 780,
  level = 18,
  experience_to_next_level = 950
WHERE username = 'ProGamer123';

-- QuizMaster99
UPDATE users 
SET 
  total_games_played = 198,
  total_wins = 152,
  total_losses = 46,
  total_questions_answered = 1980,
  total_correct_answers = 1683,
  current_streak = 12,
  best_streak = 20,
  flash_points = 8500,
  experience = 620,
  level = 16,
  experience_to_next_level = 850
WHERE username = 'QuizMaster99';

-- TwojaGra
UPDATE users 
SET 
  total_games_played = 167,
  total_wins = 121,
  total_losses = 46,
  total_questions_answered = 1670,
  total_correct_answers = 1369,
  current_streak = 5,
  best_streak = 11,
  flash_points = 7890,
  experience = 450,
  level = 14,
  experience_to_next_level = 750
WHERE username = 'TwojaGra';

-- Sprawdź zaktualizowane dane
SELECT 
  username,
  flash_points,
  level,
  total_games_played,
  total_wins,
  CASE 
    WHEN total_questions_answered > 0 
    THEN ROUND((total_correct_answers::numeric / total_questions_answered::numeric) * 100)
    ELSE 0 
  END as accuracy_percent,
  current_streak
FROM users 
WHERE username IN ('ProGamer123', 'QuizMaster99', 'TwojaGra')
ORDER BY flash_points DESC;
