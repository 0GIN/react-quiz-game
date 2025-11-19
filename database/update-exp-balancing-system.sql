-- ============================================
-- SYSTEM BALANSOWANIA DOŚWIADCZENIA (XP)
-- Aktualizacja: Listopad 2025
-- ============================================
-- 
-- Ten skrypt aktualizuje system XP dla obu trybów gry:
-- 
-- BLITZ:
-- - Progresywny system kar i nagród (-50 do +200 XP)
-- - Im więcej poprawnych odpowiedzi, tym więcej XP
-- - Słabe wyniki karą, dobre nagradzane
-- 
-- DUEL:
-- - Zwycięzca: +150 XP
-- - Przegrany: -30 XP (KARA!)
-- - Remis: +75 XP dla obu
-- - Możliwa utrata poziomu przy przegranej
-- ============================================

-- KROK 1: Funkcja pomocnicza do obliczania wymaganego XP
CREATE OR REPLACE FUNCTION calculate_required_xp(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Formuła: 100 * (1.5 ^ (level - 1))
    RETURN FLOOR(100 * POWER(1.5, current_level - 1));
END;
$$ LANGUAGE plpgsql;

-- KROK 2: Usuń starą funkcję i utwórz nową (obsługuje zarówno zyski jak i straty XP)
DROP FUNCTION IF EXISTS update_user_level(uuid, integer);

CREATE OR REPLACE FUNCTION update_user_level(p_user_id UUID, p_experience_change INTEGER)
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
    
    -- Dodaj/odejmij XP
    v_remaining_xp := v_current_xp + p_experience_change;
    v_new_level := v_current_level;
    
    -- Jeśli XP ujemne, cofnij poziomy (ale nie niżej niż 1)
    IF v_remaining_xp < 0 AND v_new_level > 1 THEN
        LOOP
            v_new_level := v_new_level - 1;
            EXIT WHEN v_new_level <= 1; -- Minimalny poziom to 1
            
            v_required_xp := calculate_required_xp(v_new_level);
            v_remaining_xp := v_remaining_xp + v_required_xp;
            
            EXIT WHEN v_remaining_xp >= 0;
        END LOOP;
        
        -- Jeśli nadal ujemne i jesteśmy na poziomie 1, ustaw na 0
        IF v_remaining_xp < 0 THEN
            v_remaining_xp := 0;
        END IF;
    END IF;
    
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
    
    -- Log dla debugowania
    RAISE NOTICE 'User % XP change: %, Level: % -> %, Remaining XP: %/%', 
        p_user_id, p_experience_change, v_current_level, v_new_level, v_remaining_xp, v_required_xp;
END;
$$ LANGUAGE plpgsql;

-- KROK 3: Zaktualizuj funkcję complete_duel_match z dynamicznym systemem nagród
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
    v_score_diff INTEGER;
    v_winner_fp INTEGER;
    v_winner_xp INTEGER;
    v_loser_fp INTEGER;
    v_loser_xp INTEGER;
BEGIN
    RAISE NOTICE '🏁 Completing duel match: %', p_match_id;
    
    -- Pobierz dane meczu
    SELECT player1_id, player2_id, player1_score, player2_score
    INTO v_player1_id, v_player2_id, v_player1_score, v_player2_score
    FROM duel_matches
    WHERE id = p_match_id;
    
    v_player1_correct := v_player1_score;
    v_player2_correct := v_player2_score;
    
    RAISE NOTICE '📊 Scores - Player1: %, Player2: %', v_player1_score, v_player2_score;
    
    -- Ustal zwycięzcę
    IF v_player1_score > v_player2_score THEN
        v_winner_id := v_player1_id;
        v_loser_id := v_player2_id;
        v_score_diff := v_player1_score - v_player2_score;
        RAISE NOTICE '🏆 Winner: Player1 (%), Score diff: %' , v_winner_id, v_score_diff;
    ELSIF v_player2_score > v_player1_score THEN
        v_winner_id := v_player2_id;
        v_loser_id := v_player1_id;
        v_score_diff := v_player2_score - v_player1_score;
        RAISE NOTICE '🏆 Winner: Player2 (%), Score diff: %', v_winner_id, v_score_diff;
    ELSE
        v_winner_id := NULL; -- Remis
        v_loser_id := NULL;
        v_score_diff := 0;
        RAISE NOTICE '🤝 Draw!';
    END IF;
    
    -- Zaktualizuj mecz
    UPDATE duel_matches
    SET 
        status = 'completed',
        winner_id = v_winner_id,
        completed_at = NOW(),
        current_turn_player_id = NULL
    WHERE id = p_match_id;
    
    -- Aktualizuj statystyki graczy z dynamicznymi nagrodami
    IF v_winner_id IS NOT NULL THEN
        -- DYNAMICZNY SYSTEM NAGRÓD oparty o różnicę w wyniku
        -- Różnica 1-2: Blisko remisu (mały zysk dla zwycięzcy, mała kara dla przegranego)
        -- Różnica 3-5: Średnia wygrana (standardowe nagrody)
        -- Różnica 6+: Dominacja (wysokie nagrody)
        
        IF v_score_diff <= 2 THEN
            -- Blisko remisu - podobne efekty jak remis
            v_winner_fp := 70;
            v_winner_xp := 90;
            v_loser_fp := 30;
            v_loser_xp := -10; -- Lekka kara
            RAISE NOTICE '💰 Close match: Winner +% FP +% XP, Loser +% FP % XP', v_winner_fp, v_winner_xp, v_loser_fp, v_loser_xp;
        ELSIF v_score_diff <= 5 THEN
            -- Standardowa wygrana
            v_winner_fp := 100;
            v_winner_xp := 150;
            v_loser_fp := 0;
            v_loser_xp := -30;
            RAISE NOTICE '💰 Standard win: Winner +% FP +% XP, Loser +% FP % XP', v_winner_fp, v_winner_xp, v_loser_fp, v_loser_xp;
        ELSE
            -- Dominacja - wysokie nagrody
            v_winner_fp := 130;
            v_winner_xp := 200;
            v_loser_fp := 0;
            v_loser_xp := -50; -- Większa kara za przegrana dominację
            RAISE NOTICE '💰 Domination: Winner +% FP +% XP, Loser +% FP % XP', v_winner_fp, v_winner_xp, v_loser_fp, v_loser_xp;
        END IF;
        
        -- Zwycięzca
        UPDATE users
        SET 
            flash_points = flash_points + v_winner_fp,
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
        PERFORM update_user_level(v_winner_id, v_winner_xp);
        
        -- Przegrany
        UPDATE users
        SET 
            flash_points = GREATEST(0, flash_points + v_loser_fp), -- Nie może być ujemne
            total_losses = total_losses + 1,
            total_games_played = total_games_played + 1,
            total_questions_answered = total_questions_answered + 15,
            total_correct_answers = total_correct_answers + (
                CASE WHEN v_loser_id = v_player1_id THEN v_player1_correct ELSE v_player2_correct END
            ),
            current_streak = 0
        WHERE id = v_loser_id;
        
        -- Przelicz level przegranego
        PERFORM update_user_level(v_loser_id, v_loser_xp);
        
    ELSE
        -- Remis: +50 FP, +75 XP dla obu
        RAISE NOTICE '💰 Awarding draw rewards: Both players +50 FP +75 XP';
        
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
    
    RAISE NOTICE '✅ Duel match completed successfully';
END;
$$ LANGUAGE plpgsql;

-- KROK 4: Funkcja pomocnicza do obliczania nagród (do użycia w UI)
CREATE OR REPLACE FUNCTION calculate_duel_rewards(
    p_winner_score INTEGER,
    p_loser_score INTEGER
)
RETURNS TABLE(
    winner_fp INTEGER,
    winner_xp INTEGER,
    loser_fp INTEGER,
    loser_xp INTEGER,
    reward_type TEXT
) AS $$
DECLARE
    v_score_diff INTEGER;
BEGIN
    v_score_diff := p_winner_score - p_loser_score;
    
    IF v_score_diff <= 2 THEN
        -- Blisko remisu
        RETURN QUERY SELECT 70, 90, 30, -10, 'close'::TEXT;
    ELSIF v_score_diff <= 5 THEN
        -- Standardowa wygrana
        RETURN QUERY SELECT 100, 150, 0, -30, 'standard'::TEXT;
    ELSE
        -- Dominacja
        RETURN QUERY SELECT 130, 200, 0, -50, 'domination'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- KONIEC AKTUALIZACJI
-- ============================================

-- Sprawdź czy funkcje zostały utworzone
SELECT 
    'calculate_required_xp' as function_name,
    pg_get_functiondef(oid) IS NOT NULL as exists
FROM pg_proc 
WHERE proname = 'calculate_required_xp'
UNION ALL
SELECT 
    'update_user_level' as function_name,
    pg_get_functiondef(oid) IS NOT NULL as exists
FROM pg_proc 
WHERE proname = 'update_user_level'
UNION ALL
SELECT 
    'complete_duel_match' as function_name,
    pg_get_functiondef(oid) IS NOT NULL as exists
FROM pg_proc 
WHERE proname = 'complete_duel_match';

-- Pokaż przykładowe wymagania XP dla poziomów 1-10
SELECT 
    level,
    calculate_required_xp(level) as xp_required
FROM generate_series(1, 10) as level;
