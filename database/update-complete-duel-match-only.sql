-- ============================================
-- AKTUALIZACJA FUNKCJI complete_duel_match
-- Dodaje XP i Flash Points po zakończeniu pojedynku
-- ORAZ PRZELICZA LEVEL AUTOMATYCZNIE
-- ============================================

-- Najpierw potrzebujemy funkcji pomocniczej do obliczania wymaganego XP
CREATE OR REPLACE FUNCTION calculate_required_xp(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Formuła: 100 * (1.5 ^ (level - 1))
    RETURN FLOOR(100 * POWER(1.5, current_level - 1));
END;
$$ LANGUAGE plpgsql;

-- Funkcja do przeliczania levelu po dodaniu XP
CREATE OR REPLACE FUNCTION update_user_level(p_user_id UUID, p_experience_gained INTEGER)
RETURNS VOID AS $$
DECLARE
    v_current_level INTEGER;
    v_current_xp INTEGER;
    v_required_xp INTEGER;
    v_new_level INTEGER;
    v_remaining_xp INTEGER;
BEGIN
    -- Pobierz obecne dane użytkownika
    SELECT level, experience INTO v_current_level, v_current_xp
    FROM users
    WHERE id = p_user_id;
    
    -- Dodaj zdobyte XP
    v_remaining_xp := v_current_xp + p_experience_gained;
    v_new_level := v_current_level;
    
    -- Sprawdź czy użytkownik awansował (może być kilka poziomów naraz)
    LOOP
        v_required_xp := calculate_required_xp(v_new_level);
        
        IF v_remaining_xp >= v_required_xp THEN
            v_remaining_xp := v_remaining_xp - v_required_xp;
            v_new_level := v_new_level + 1;
        ELSE
            EXIT;
        END IF;
    END LOOP;
    
    -- Oblicz wymagane XP na nowy poziom
    v_required_xp := calculate_required_xp(v_new_level);
    
    -- Zaktualizuj użytkownika
    UPDATE users
    SET 
        level = v_new_level,
        experience = v_remaining_xp,
        experience_to_next_level = v_required_xp
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

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
    
    -- Zaktualizuj mecz
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
            total_wins = total_wins + 1,
            total_games_played = total_games_played + 1,
            total_questions_answered = total_questions_answered + 15,
            total_correct_answers = total_correct_answers + (
                CASE WHEN v_winner_id = v_player1_id THEN v_player1_correct ELSE v_player2_correct END
            ),
            current_streak = current_streak + 1,
            best_streak = GREATEST(best_streak, current_streak + 1)
        WHERE id = v_winner_id;
        
        -- Przelicz level zwycięzcy
        PERFORM update_user_level(v_winner_id, 150);
        
        -- Przegrany: +0 FP, +50 XP
        UPDATE users
        SET 
            total_losses = total_losses + 1,
            total_games_played = total_games_played + 1,
            total_questions_answered = total_questions_answered + 15,
            total_correct_answers = total_correct_answers + (
                CASE WHEN v_loser_id = v_player1_id THEN v_player1_correct ELSE v_player2_correct END
            ),
            current_streak = 0
        WHERE id = v_loser_id;
        
        -- Przelicz level przegranego
        PERFORM update_user_level(v_loser_id, 50);
    ELSE
        -- Remis: +50 FP, +75 XP dla obu
        UPDATE users
        SET 
            flash_points = flash_points + 50,
            total_draws = total_draws + 1,
            total_games_played = total_games_played + 1,
            total_questions_answered = total_questions_answered + 15,
            total_correct_answers = total_correct_answers + (
                CASE WHEN id = v_player1_id THEN v_player1_correct ELSE v_player2_correct END
            )
        WHERE id IN (v_player1_id, v_player2_id);
        
        -- Przelicz level obu graczy
        PERFORM update_user_level(v_player1_id, 75);
        PERFORM update_user_level(v_player2_id, 75);
    END IF;
END;
$$ LANGUAGE plpgsql;
