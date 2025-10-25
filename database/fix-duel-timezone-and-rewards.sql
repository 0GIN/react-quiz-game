-- KROK 1: Zmień typ completed_at na timestamp WITH time zone
ALTER TABLE duel_matches 
  ALTER COLUMN completed_at TYPE timestamp with time zone 
  USING completed_at AT TIME ZONE 'UTC';

ALTER TABLE duel_matches 
  ALTER COLUMN created_at TYPE timestamp with time zone 
  USING created_at AT TIME ZONE 'UTC';

ALTER TABLE duel_matches 
  ALTER COLUMN accepted_at TYPE timestamp with time zone 
  USING accepted_at AT TIME ZONE 'UTC';

ALTER TABLE duel_matches 
  ALTER COLUMN last_activity_at TYPE timestamp with time zone 
  USING last_activity_at AT TIME ZONE 'UTC';

-- KROK 2: Zmień typ w duel_rounds
ALTER TABLE duel_rounds 
  ALTER COLUMN created_at TYPE timestamp with time zone 
  USING created_at AT TIME ZONE 'UTC';

ALTER TABLE duel_rounds 
  ALTER COLUMN player1_answered_at TYPE timestamp with time zone 
  USING player1_answered_at AT TIME ZONE 'UTC';

ALTER TABLE duel_rounds 
  ALTER COLUMN player2_answered_at TYPE timestamp with time zone 
  USING player2_answered_at AT TIME ZONE 'UTC';

-- KROK 3: Zmień typ w duel_answers
ALTER TABLE duel_answers 
  ALTER COLUMN answered_at TYPE timestamp with time zone 
  USING answered_at AT TIME ZONE 'UTC';

-- KROK 4: Napraw funkcję complete_duel_match z prawidłowymi nagrodami
CREATE OR REPLACE FUNCTION complete_duel_match(p_match_id UUID)
RETURNS VOID AS $$
DECLARE
    v_player1_score INTEGER;
    v_player2_score INTEGER;
    v_player1_id UUID;
    v_player2_id UUID;
    v_winner_id UUID;
    v_loser_id UUID;
    v_player1_correct INTEGER;
    v_player2_correct INTEGER;
BEGIN
    -- Pobierz dane meczu
    SELECT player1_id, player2_id, player1_score, player2_score
    INTO v_player1_id, v_player2_id, v_player1_score, v_player2_score
    FROM duel_matches
    WHERE id = p_match_id;
    
    v_player1_correct := v_player1_score;
    v_player2_correct := v_player2_score;
    
    -- Ustal zwycięzcę
    IF v_player1_score > v_player2_score THEN
        v_winner_id := v_player1_id;
        v_loser_id := v_player2_id;
    ELSIF v_player2_score > v_player1_score THEN
        v_winner_id := v_player2_id;
        v_loser_id := v_player1_id;
    ELSE
        v_winner_id := NULL; -- Remis
        v_loser_id := NULL;
    END IF;
    
    -- Zaktualizuj mecz z NOW() (UTC timestamp)
    UPDATE duel_matches
    SET 
        status = 'completed',
        winner_id = v_winner_id,
        completed_at = NOW(),
        current_turn_player_id = NULL
    WHERE id = p_match_id;
    
    -- Aktualizuj statystyki graczy
    IF v_winner_id IS NOT NULL THEN
        -- Zwycięzca: +100 FP, +150 XP
        UPDATE users
        SET 
            flash_points = flash_points + 100,
            experience = experience + 150,
            total_wins = total_wins + 1,
            total_games_played = total_games_played + 1,
            total_questions_answered = total_questions_answered + 15,
            total_correct_answers = total_correct_answers + (
                CASE WHEN v_winner_id = v_player1_id THEN v_player1_correct ELSE v_player2_correct END
            ),
            current_streak = current_streak + 1,
            best_streak = GREATEST(best_streak, current_streak + 1)
        WHERE id = v_winner_id;
        
        -- Przegrany: +0 FP, +50 XP
        UPDATE users
        SET 
            experience = experience + 50,
            total_losses = total_losses + 1,
            total_games_played = total_games_played + 1,
            total_questions_answered = total_questions_answered + 15,
            total_correct_answers = total_correct_answers + (
                CASE WHEN v_loser_id = v_player1_id THEN v_player1_correct ELSE v_player2_correct END
            ),
            current_streak = 0
        WHERE id = v_loser_id;
    ELSE
        -- Remis: +50 FP, +75 XP dla obu
        UPDATE users
        SET 
            flash_points = flash_points + 50,
            experience = experience + 75,
            total_draws = total_draws + 1,
            total_games_played = total_games_played + 1,
            total_questions_answered = total_questions_answered + 15,
            total_correct_answers = total_correct_answers + (
                CASE WHEN id = v_player1_id THEN v_player1_correct ELSE v_player2_correct END
            )
        WHERE id IN (v_player1_id, v_player2_id);
    END IF;
END;
$$ LANGUAGE plpgsql;
