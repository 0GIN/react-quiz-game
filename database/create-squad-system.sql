-- =============================================
-- SQUAD MODE SYSTEM
-- 2v2 team battles with matchmaking
-- =============================================

-- Squad matches table
CREATE TABLE IF NOT EXISTS squad_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Team A (first team)
    team_a_player1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_a_player2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Team B (second team)
    team_b_player1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_b_player2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Match settings
    category_id INTEGER REFERENCES categories(id),
    total_rounds INTEGER NOT NULL DEFAULT 10,
    current_round INTEGER NOT NULL DEFAULT 0,
    
    -- Scores
    team_a_score INTEGER NOT NULL DEFAULT 0,
    team_b_score INTEGER NOT NULL DEFAULT 0,
    
    -- Status
    status TEXT NOT NULL CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
    
    -- Winner
    winning_team TEXT CHECK (winning_team IN ('team_a', 'team_b', 'draw')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT different_players CHECK (
        team_a_player1_id != team_a_player2_id AND
        team_b_player1_id != team_b_player2_id AND
        team_a_player1_id NOT IN (team_b_player1_id, team_b_player2_id) AND
        team_a_player2_id NOT IN (team_b_player1_id, team_b_player2_id)
    )
);

-- Squad rounds table (stores each round's questions and answers)
CREATE TABLE IF NOT EXISTS squad_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES squad_matches(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    question_id UUID NOT NULL REFERENCES questions(id),
    
    -- Team A answers
    team_a_player1_answer TEXT,
    team_a_player1_correct BOOLEAN,
    team_a_player1_time INTEGER,
    team_a_player2_answer TEXT,
    team_a_player2_correct BOOLEAN,
    team_a_player2_time INTEGER,
    
    -- Team B answers
    team_b_player1_answer TEXT,
    team_b_player1_correct BOOLEAN,
    team_b_player1_time INTEGER,
    team_b_player2_answer TEXT,
    team_b_player2_correct BOOLEAN,
    team_b_player2_time INTEGER,
    
    -- Round results
    team_a_round_points INTEGER NOT NULL DEFAULT 0,
    team_b_round_points INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(match_id, round_number)
);

-- Squad matchmaking queue
CREATE TABLE IF NOT EXISTS squad_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Players
    player1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    player2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL if solo queue
    
    -- Queue settings
    category_id INTEGER REFERENCES categories(id),
    is_invited BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE if player2 was invited
    
    -- Status
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    matched_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT different_queue_players CHECK (
        player2_id IS NULL OR player1_id != player2_id
    )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_squad_matches_players ON squad_matches(team_a_player1_id, team_a_player2_id, team_b_player1_id, team_b_player2_id);
CREATE INDEX IF NOT EXISTS idx_squad_matches_status ON squad_matches(status);
CREATE INDEX IF NOT EXISTS idx_squad_matches_created ON squad_matches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_squad_rounds_match ON squad_rounds(match_id, round_number);
CREATE INDEX IF NOT EXISTS idx_squad_queue_status ON squad_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_squad_queue_players ON squad_queue(player1_id, player2_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Join squad queue (solo or with friend)
CREATE OR REPLACE FUNCTION join_squad_queue(
    p_player1_id UUID,
    p_player2_id UUID DEFAULT NULL,
    p_category_id INTEGER DEFAULT NULL,
    p_is_invited BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_queue_id UUID;
BEGIN
    -- Validate players exist
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_player1_id) THEN
        RAISE EXCEPTION 'Player 1 not found';
    END IF;
    
    IF p_player2_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_player2_id) THEN
        RAISE EXCEPTION 'Player 2 not found';
    END IF;
    
    -- Check if player1 is already in queue
    IF EXISTS (
        SELECT 1 FROM squad_queue 
        WHERE (player1_id = p_player1_id OR player2_id = p_player1_id)
        AND status = 'waiting'
    ) THEN
        RAISE EXCEPTION 'Player 1 is already in queue';
    END IF;
    
    -- Check if player2 is already in queue (if provided)
    IF p_player2_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM squad_queue 
        WHERE (player1_id = p_player2_id OR player2_id = p_player2_id)
        AND status = 'waiting'
    ) THEN
        RAISE EXCEPTION 'Player 2 is already in queue';
    END IF;
    
    -- Insert into queue
    INSERT INTO squad_queue (
        player1_id,
        player2_id,
        category_id,
        is_invited,
        status
    ) VALUES (
        p_player1_id,
        p_player2_id,
        p_category_id,
        p_is_invited,
        'waiting'
    ) RETURNING id INTO v_queue_id;
    
    RETURN v_queue_id;
END;
$$;

-- Leave squad queue
CREATE OR REPLACE FUNCTION leave_squad_queue(p_player_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE squad_queue
    SET status = 'cancelled'
    WHERE (player1_id = p_player_id OR player2_id = p_player_id)
    AND status = 'waiting';
    
    RETURN FOUND;
END;
$$;

-- Match two teams from queue
CREATE OR REPLACE FUNCTION match_squad_teams()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_team_a RECORD;
    v_team_b RECORD;
    v_match_id UUID;
BEGIN
    -- Find two waiting teams
    -- Priority: teams with same category preference
    SELECT * INTO v_team_a
    FROM squad_queue
    WHERE status = 'waiting'
    AND player2_id IS NOT NULL  -- Only complete teams
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF v_team_a IS NULL THEN
        RETURN NULL; -- No teams waiting
    END IF;
    
    -- Find second team (prefer same category)
    SELECT * INTO v_team_b
    FROM squad_queue
    WHERE status = 'waiting'
    AND player2_id IS NOT NULL
    AND id != v_team_a.id
    AND (category_id = v_team_a.category_id OR category_id IS NULL OR v_team_a.category_id IS NULL)
    ORDER BY 
        CASE WHEN category_id = v_team_a.category_id THEN 0 ELSE 1 END,
        created_at ASC
    LIMIT 1;
    
    IF v_team_b IS NULL THEN
        RETURN NULL; -- No matching team found
    END IF;
    
    -- Create match
    INSERT INTO squad_matches (
        team_a_player1_id,
        team_a_player2_id,
        team_b_player1_id,
        team_b_player2_id,
        category_id,
        status
    ) VALUES (
        v_team_a.player1_id,
        v_team_a.player2_id,
        v_team_b.player1_id,
        v_team_b.player2_id,
        COALESCE(v_team_a.category_id, v_team_b.category_id),
        'waiting'
    ) RETURNING id INTO v_match_id;
    
    -- Update queue entries
    UPDATE squad_queue
    SET status = 'matched', matched_at = NOW()
    WHERE id IN (v_team_a.id, v_team_b.id);
    
    RETURN v_match_id;
END;
$$;

-- Start squad match
CREATE OR REPLACE FUNCTION start_squad_match(p_match_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE squad_matches
    SET 
        status = 'in_progress',
        started_at = NOW(),
        current_round = 1
    WHERE id = p_match_id
    AND status = 'waiting';
    
    RETURN FOUND;
END;
$$;

-- Submit squad round answers
CREATE OR REPLACE FUNCTION submit_squad_round_answer(
    p_match_id UUID,
    p_round_number INTEGER,
    p_player_id UUID,
    p_answer TEXT,
    p_time_taken INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_match RECORD;
    v_round RECORD;
    v_is_correct BOOLEAN;
    v_player_position TEXT;
BEGIN
    -- Get match info
    SELECT * INTO v_match FROM squad_matches WHERE id = p_match_id;
    
    IF v_match IS NULL THEN
        RAISE EXCEPTION 'Match not found';
    END IF;
    
    -- Determine player position
    IF v_match.team_a_player1_id = p_player_id THEN
        v_player_position := 'team_a_player1';
    ELSIF v_match.team_a_player2_id = p_player_id THEN
        v_player_position := 'team_a_player2';
    ELSIF v_match.team_b_player1_id = p_player_id THEN
        v_player_position := 'team_b_player1';
    ELSIF v_match.team_b_player2_id = p_player_id THEN
        v_player_position := 'team_b_player2';
    ELSE
        RAISE EXCEPTION 'Player not in this match';
    END IF;
    
    -- Get round info
    SELECT * INTO v_round FROM squad_rounds WHERE match_id = p_match_id AND round_number = p_round_number;
    
    IF v_round IS NULL THEN
        RAISE EXCEPTION 'Round not found';
    END IF;
    
    -- Check if answer is correct
    SELECT (correct_answer = p_answer) INTO v_is_correct
    FROM questions
    WHERE id = v_round.question_id;
    
    -- Update round with player's answer
    IF v_player_position = 'team_a_player1' THEN
        UPDATE squad_rounds SET
            team_a_player1_answer = p_answer,
            team_a_player1_correct = v_is_correct,
            team_a_player1_time = p_time_taken
        WHERE id = v_round.id;
    ELSIF v_player_position = 'team_a_player2' THEN
        UPDATE squad_rounds SET
            team_a_player2_answer = p_answer,
            team_a_player2_correct = v_is_correct,
            team_a_player2_time = p_time_taken
        WHERE id = v_round.id;
    ELSIF v_player_position = 'team_b_player1' THEN
        UPDATE squad_rounds SET
            team_b_player1_answer = p_answer,
            team_b_player1_correct = v_is_correct,
            team_b_player1_time = p_time_taken
        WHERE id = v_round.id;
    ELSIF v_player_position = 'team_b_player2' THEN
        UPDATE squad_rounds SET
            team_b_player2_answer = p_answer,
            team_b_player2_correct = v_is_correct,
            team_b_player2_time = p_time_taken
        WHERE id = v_round.id;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Calculate squad round results
CREATE OR REPLACE FUNCTION calculate_squad_round_results(
    p_match_id UUID,
    p_round_number INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_round RECORD;
    v_team_a_points INTEGER := 0;
    v_team_b_points INTEGER := 0;
BEGIN
    SELECT * INTO v_round FROM squad_rounds 
    WHERE match_id = p_match_id AND round_number = p_round_number;
    
    IF v_round IS NULL THEN
        RAISE EXCEPTION 'Round not found';
    END IF;
    
    -- Calculate Team A points
    IF v_round.team_a_player1_correct THEN
        v_team_a_points := v_team_a_points + GREATEST(10 - FLOOR(v_round.team_a_player1_time / 1000), 1);
    END IF;
    IF v_round.team_a_player2_correct THEN
        v_team_a_points := v_team_a_points + GREATEST(10 - FLOOR(v_round.team_a_player2_time / 1000), 1);
    END IF;
    
    -- Calculate Team B points
    IF v_round.team_b_player1_correct THEN
        v_team_b_points := v_team_b_points + GREATEST(10 - FLOOR(v_round.team_b_player1_time / 1000), 1);
    END IF;
    IF v_round.team_b_player2_correct THEN
        v_team_b_points := v_team_b_points + GREATEST(10 - FLOOR(v_round.team_b_player2_time / 1000), 1);
    END IF;
    
    -- Update round points
    UPDATE squad_rounds
    SET 
        team_a_round_points = v_team_a_points,
        team_b_round_points = v_team_b_points
    WHERE id = v_round.id;
    
    -- Update match scores
    UPDATE squad_matches
    SET 
        team_a_score = team_a_score + v_team_a_points,
        team_b_score = team_b_score + v_team_b_points
    WHERE id = p_match_id;
    
    RETURN TRUE;
END;
$$;

-- Complete squad match
CREATE OR REPLACE FUNCTION complete_squad_match(p_match_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_match RECORD;
    v_winner TEXT;
    v_exp_reward INTEGER := 150;
    v_coins_reward INTEGER := 100;
BEGIN
    SELECT * INTO v_match FROM squad_matches WHERE id = p_match_id;
    
    IF v_match IS NULL THEN
        RAISE EXCEPTION 'Match not found';
    END IF;
    
    -- Determine winner
    IF v_match.team_a_score > v_match.team_b_score THEN
        v_winner := 'team_a';
    ELSIF v_match.team_b_score > v_match.team_a_score THEN
        v_winner := 'team_b';
    ELSE
        v_winner := 'draw';
    END IF;
    
    -- Update match
    UPDATE squad_matches
    SET 
        status = 'completed',
        completed_at = NOW(),
        winning_team = v_winner
    WHERE id = p_match_id;
    
    -- Reward winners (double rewards for winners)
    IF v_winner = 'team_a' THEN
        UPDATE user_stats
        SET 
            experience = experience + v_exp_reward,
            coins = coins + v_coins_reward
        WHERE user_id IN (v_match.team_a_player1_id, v_match.team_a_player2_id);
        
        -- Consolation for losers
        UPDATE user_stats
        SET 
            experience = experience + (v_exp_reward / 2),
            coins = coins + (v_coins_reward / 2)
        WHERE user_id IN (v_match.team_b_player1_id, v_match.team_b_player2_id);
    ELSIF v_winner = 'team_b' THEN
        UPDATE user_stats
        SET 
            experience = experience + v_exp_reward,
            coins = coins + v_coins_reward
        WHERE user_id IN (v_match.team_b_player1_id, v_match.team_b_player2_id);
        
        -- Consolation for losers
        UPDATE user_stats
        SET 
            experience = experience + (v_exp_reward / 2),
            coins = coins + (v_coins_reward / 2)
        WHERE user_id IN (v_match.team_a_player1_id, v_match.team_a_player2_id);
    ELSE
        -- Draw: everyone gets half rewards
        UPDATE user_stats
        SET 
            experience = experience + (v_exp_reward / 2),
            coins = coins + (v_coins_reward / 2)
        WHERE user_id IN (
            v_match.team_a_player1_id, v_match.team_a_player2_id,
            v_match.team_b_player1_id, v_match.team_b_player2_id
        );
    END IF;
    
    RETURN TRUE;
END;
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE squad_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_queue ENABLE ROW LEVEL SECURITY;

-- Squad matches: players can see their own matches
CREATE POLICY "Users can view their squad matches"
    ON squad_matches FOR SELECT
    USING (
        auth.uid() IN (team_a_player1_id, team_a_player2_id, team_b_player1_id, team_b_player2_id)
    );

CREATE POLICY "Users can insert squad matches via function"
    ON squad_matches FOR INSERT
    WITH CHECK (false); -- Only via functions

CREATE POLICY "Users can update their squad matches via function"
    ON squad_matches FOR UPDATE
    USING (false); -- Only via functions

-- Squad rounds: players can see rounds from their matches
CREATE POLICY "Users can view their squad rounds"
    ON squad_rounds FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM squad_matches
            WHERE squad_matches.id = squad_rounds.match_id
            AND auth.uid() IN (team_a_player1_id, team_a_player2_id, team_b_player1_id, team_b_player2_id)
        )
    );

CREATE POLICY "Users can insert squad rounds via function"
    ON squad_rounds FOR INSERT
    WITH CHECK (false); -- Only via functions

CREATE POLICY "Users can update squad rounds via function"
    ON squad_rounds FOR UPDATE
    USING (false); -- Only via functions

-- Squad queue: users can see queue entries involving them
CREATE POLICY "Users can view their queue entries"
    ON squad_queue FOR SELECT
    USING (
        auth.uid() IN (player1_id, player2_id)
    );

CREATE POLICY "Users can insert queue entries via function"
    ON squad_queue FOR INSERT
    WITH CHECK (false); -- Only via functions

CREATE POLICY "Users can update queue entries via function"
    ON squad_queue FOR UPDATE
    USING (false); -- Only via functions

-- =============================================
-- REALTIME
-- =============================================

-- Enable realtime for squad system
ALTER PUBLICATION supabase_realtime ADD TABLE squad_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE squad_rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE squad_queue;
