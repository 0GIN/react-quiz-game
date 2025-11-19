-- ============================================
-- RANKED MATCHMAKING SYSTEM
-- Automatyczne dopasowywanie graczy w kolejce rankingowej
-- ============================================

-- Tabela kolejki rankingowej (osobna od zwykłej kolejki)
CREATE TABLE IF NOT EXISTS ranked_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    flash_points INTEGER NOT NULL DEFAULT 0,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Jeden użytkownik może być tylko raz w kolejce
    UNIQUE(user_id)
);

-- Index dla szybkiego wyszukiwania po poziomie
CREATE INDEX IF NOT EXISTS idx_ranked_queue_level ON ranked_queue(level);
CREATE INDEX IF NOT EXISTS idx_ranked_queue_created ON ranked_queue(created_at);

-- ============================================
-- FUNKCJA: Automatyczne dopasowanie gracza
-- ============================================
CREATE OR REPLACE FUNCTION find_ranked_match(p_user_id UUID, p_level INTEGER)
RETURNS TABLE(
    match_id UUID,
    opponent_id UUID,
    opponent_username TEXT,
    opponent_level INTEGER,
    opponent_avatar TEXT
) AS $$
DECLARE
    v_min_level INTEGER;
    v_max_level INTEGER;
    v_opponent_queue_id UUID;
    v_opponent_id UUID;
    v_new_match_id UUID;
BEGIN
    -- Zakres poziomów: aktualny +/- 1
    v_min_level := GREATEST(1, p_level - 1);
    v_max_level := p_level + 1;
    
    RAISE NOTICE '🔍 Searching for opponent. Level range: % - %', v_min_level, v_max_level;
    
    -- Znajdź najstarszego gracza w zakresie poziomów (najdłużej czeka)
    SELECT rq.id, rq.user_id
    INTO v_opponent_queue_id, v_opponent_id
    FROM ranked_queue rq
    WHERE rq.user_id != p_user_id
        AND rq.level >= v_min_level
        AND rq.level <= v_max_level
    ORDER BY rq.created_at ASC
    LIMIT 1;
    
    -- Jeśli znaleziono przeciwnika
    IF v_opponent_id IS NOT NULL THEN
        RAISE NOTICE '✅ Found opponent: %', v_opponent_id;
        
        -- Utwórz mecz (player1 = szukający, player2 = znaleziony)
        INSERT INTO duel_matches (
            player1_id,
            player2_id,
            status,
            current_round,
            player1_score,
            player2_score,
            is_ranked
        ) VALUES (
            p_user_id,
            v_opponent_id,
            'active',
            1,
            0,
            0,
            true  -- Oznacz jako ranked
        )
        RETURNING id INTO v_new_match_id;
        
        -- Usuń obu graczy z kolejki
        DELETE FROM ranked_queue WHERE user_id IN (p_user_id, v_opponent_id);
        
        RAISE NOTICE '🎮 Match created: %', v_new_match_id;
        
        -- Zwróć dane meczu
        RETURN QUERY
        SELECT 
            v_new_match_id,
            u.id,
            u.username,
            u.level,
            u.avatar_url
        FROM users u
        WHERE u.id = v_opponent_id;
    ELSE
        RAISE NOTICE '❌ No opponent found in level range % - %', v_min_level, v_max_level;
        -- Brak przeciwnika - zwróć puste
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNKCJA: Dołącz do kolejki rankingowej
-- ============================================
CREATE OR REPLACE FUNCTION join_ranked_queue(
    p_user_id UUID,
    p_level INTEGER,
    p_flash_points INTEGER,
    p_message TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    match_found BOOLEAN,
    match_id UUID,
    opponent_id UUID,
    opponent_username TEXT,
    opponent_level INTEGER,
    opponent_avatar TEXT,
    error TEXT
) AS $$
DECLARE
    v_match_result RECORD;
BEGIN
    -- Sprawdź czy użytkownik już nie jest w kolejce
    IF EXISTS (SELECT 1 FROM ranked_queue WHERE user_id = p_user_id) THEN
        RETURN QUERY SELECT false, false, NULL::UUID, NULL::UUID, NULL::TEXT, NULL::INTEGER, NULL::TEXT, 'Już jesteś w kolejce'::TEXT;
        RETURN;
    END IF;
    
    -- Dodaj do kolejki
    INSERT INTO ranked_queue (user_id, level, flash_points, message)
    VALUES (p_user_id, p_level, p_flash_points, p_message);
    
    RAISE NOTICE '✅ User % added to ranked queue (Level %)', p_user_id, p_level;
    
    -- Spróbuj od razu znaleźć mecz
    SELECT * INTO v_match_result
    FROM find_ranked_match(p_user_id, p_level)
    LIMIT 1;
    
    IF v_match_result.match_id IS NOT NULL THEN
        -- Znaleziono mecz!
        RAISE NOTICE '🎯 Instant match found!';
        RETURN QUERY SELECT 
            true, 
            true, 
            v_match_result.match_id,
            v_match_result.opponent_id,
            v_match_result.opponent_username,
            v_match_result.opponent_level,
            v_match_result.opponent_avatar,
            NULL::TEXT;
    ELSE
        -- Czekaj w kolejce
        RAISE NOTICE '⏳ Waiting in queue...';
        RETURN QUERY SELECT true, false, NULL::UUID, NULL::UUID, NULL::TEXT, NULL::INTEGER, NULL::TEXT, NULL::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNKCJA: Opuść kolejkę rankingową
-- ============================================
CREATE OR REPLACE FUNCTION leave_ranked_queue(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM ranked_queue WHERE user_id = p_user_id;
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Dodaj kolumnę is_ranked do duel_matches (jeśli nie istnieje)
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'duel_matches' AND column_name = 'is_ranked'
    ) THEN
        ALTER TABLE duel_matches ADD COLUMN is_ranked BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added is_ranked column to duel_matches';
    ELSE
        RAISE NOTICE 'ℹ️ Column is_ranked already exists';
    END IF;
END $$;

-- ============================================
-- RLS Policies dla ranked_queue
-- ============================================
ALTER TABLE ranked_queue ENABLE ROW LEVEL SECURITY;

-- Usuń stare policies jeśli istnieją
DROP POLICY IF EXISTS "Everyone can view ranked queue" ON ranked_queue;
DROP POLICY IF EXISTS "Users can insert own entry" ON ranked_queue;
DROP POLICY IF EXISTS "Users can delete own entry" ON ranked_queue;

-- Gracze mogą widzieć wszystkie wpisy w kolejce
CREATE POLICY "Everyone can view ranked queue"
    ON ranked_queue FOR SELECT
    USING (true);

-- Gracze mogą dodawać tylko swoje wpisy
CREATE POLICY "Users can insert own entry"
    ON ranked_queue FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Gracze mogą usuwać tylko swoje wpisy
CREATE POLICY "Users can delete own entry"
    ON ranked_queue FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Automatyczne opuszczanie kolejki przy starcie meczu
-- ============================================
CREATE OR REPLACE FUNCTION auto_leave_ranked_queue()
RETURNS TRIGGER AS $$
BEGIN
    -- Gdy mecz zostaje utworzony lub zaakceptowany, usuń obu graczy z kolejki
    IF (TG_OP = 'INSERT' AND NEW.status IN ('active', 'pending')) OR 
       (TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'active') THEN
        
        RAISE NOTICE '🔄 Auto-removing players from ranked queue for match %', NEW.id;
        
        -- Usuń obu graczy z ranked_queue
        DELETE FROM ranked_queue 
        WHERE user_id IN (NEW.player1_id, NEW.player2_id);
        
        RAISE NOTICE '✅ Players removed from ranked queue';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Dodaj trigger
DROP TRIGGER IF EXISTS trigger_auto_leave_ranked_queue ON duel_matches;
CREATE TRIGGER trigger_auto_leave_ranked_queue
    AFTER INSERT OR UPDATE ON duel_matches
    FOR EACH ROW
    EXECUTE FUNCTION auto_leave_ranked_queue();

-- ============================================
-- KONIEC SKRYPTU
-- ============================================

SELECT 'Ranked matchmaking system created successfully!' as status;
