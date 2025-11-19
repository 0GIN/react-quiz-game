-- Add Master mode support (category-specific ranked matches)
-- Master = Ranked Duel limited to one chosen category

-- Add master_category_id to duel_matches
ALTER TABLE duel_matches
ADD COLUMN IF NOT EXISTS master_category_id integer REFERENCES categories(id);

COMMENT ON COLUMN duel_matches.master_category_id IS 'Category ID for Master mode (all rounds use this category)';

-- Add master_category_id to ranked_queue
ALTER TABLE ranked_queue
ADD COLUMN IF NOT EXISTS master_category_id integer REFERENCES categories(id);

COMMENT ON COLUMN ranked_queue.master_category_id IS 'Category ID for Master mode matchmaking';

-- Add joined_at timestamp if it doesn't exist
ALTER TABLE ranked_queue
ADD COLUMN IF NOT EXISTS joined_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP;

COMMENT ON COLUMN ranked_queue.joined_at IS 'When the user joined the queue';

-- Create index for faster Master mode matchmaking
CREATE INDEX IF NOT EXISTS idx_ranked_queue_master_category 
ON ranked_queue(master_category_id, level);

-- Update find_ranked_match function to support Master mode
CREATE OR REPLACE FUNCTION find_ranked_match(
  p_user_id uuid,
  p_level integer,
  p_master_category_id integer DEFAULT NULL
)
RETURNS TABLE (
  match_id uuid,
  opponent_id uuid,
  opponent_username text,
  opponent_level integer,
  opponent_avatar text
) AS $$
DECLARE
  v_opponent_record RECORD;
  v_new_match_id uuid;
BEGIN
  -- Find opponent in queue within ±1 level range
  -- If master_category_id is provided, match only same category
  IF p_master_category_id IS NOT NULL THEN
    -- Master mode: match by level AND category
    SELECT rq.user_id, u.username, u.level, u.avatar_url
    INTO v_opponent_record
    FROM ranked_queue rq
    JOIN users u ON u.id = rq.user_id
    WHERE rq.user_id != p_user_id
      AND rq.level BETWEEN (p_level - 1) AND (p_level + 1)
      AND rq.master_category_id = p_master_category_id
    ORDER BY ABS(rq.level - p_level), rq.joined_at
    LIMIT 1;
  ELSE
    -- Regular ranked mode: match by level only
    SELECT rq.user_id, u.username, u.level, u.avatar_url
    INTO v_opponent_record
    FROM ranked_queue rq
    JOIN users u ON u.id = rq.user_id
    WHERE rq.user_id != p_user_id
      AND rq.level BETWEEN (p_level - 1) AND (p_level + 1)
      AND rq.master_category_id IS NULL  -- Only match with regular ranked players
    ORDER BY ABS(rq.level - p_level), rq.joined_at
    LIMIT 1;
  END IF;

  -- If no opponent found, return empty
  IF v_opponent_record.user_id IS NULL THEN
    RETURN;
  END IF;

  -- Create new match
  INSERT INTO duel_matches (
    player1_id,
    player2_id,
    status,
    current_round,
    is_ranked,
    master_category_id
  ) VALUES (
    p_user_id,
    v_opponent_record.user_id,
    'active',
    1,
    true,
    p_master_category_id
  )
  RETURNING id INTO v_new_match_id;

  -- Remove both players from queue
  DELETE FROM ranked_queue 
  WHERE user_id IN (p_user_id, v_opponent_record.user_id);

  -- Return match details
  RETURN QUERY
  SELECT 
    v_new_match_id,
    v_opponent_record.user_id,
    v_opponent_record.username,
    v_opponent_record.level,
    v_opponent_record.avatar_url;
END;
$$ LANGUAGE plpgsql;

-- Update join_ranked_queue to support Master mode
CREATE OR REPLACE FUNCTION join_ranked_queue(
  p_user_id uuid,
  p_level integer,
  p_flash_points integer,
  p_master_category_id integer DEFAULT NULL
)
RETURNS TABLE (
  success boolean,
  match_found boolean,
  match_id uuid,
  opponent_id uuid,
  opponent_username text,
  opponent_level integer,
  opponent_avatar text,
  error text
) AS $$
DECLARE
  v_match_record RECORD;
  v_existing_match uuid;
BEGIN
  -- Check if user already has an active match
  SELECT id INTO v_existing_match
  FROM duel_matches
  WHERE (player1_id = p_user_id OR player2_id = p_user_id)
    AND status = 'active'
  LIMIT 1;

  IF v_existing_match IS NOT NULL THEN
    RETURN QUERY SELECT false, false, NULL::uuid, NULL::uuid, NULL::text, NULL::integer, NULL::text, 'Already in active match'::text;
    RETURN;
  END IF;

  -- Check if already in queue
  IF EXISTS (SELECT 1 FROM ranked_queue WHERE user_id = p_user_id) THEN
    RETURN QUERY SELECT false, false, NULL::uuid, NULL::uuid, NULL::text, NULL::integer, NULL::text, 'Already in queue'::text;
    RETURN;
  END IF;

  -- Try to find a match immediately
  SELECT * INTO v_match_record
  FROM find_ranked_match(p_user_id, p_level, p_master_category_id);

  -- If match found, return details
  IF v_match_record.match_id IS NOT NULL THEN
    RETURN QUERY SELECT true, true, v_match_record.match_id, v_match_record.opponent_id, 
                        v_match_record.opponent_username, v_match_record.opponent_level, 
                        v_match_record.opponent_avatar, NULL::text;
    RETURN;
  END IF;

  -- No match found, add to queue
  INSERT INTO ranked_queue (user_id, level, flash_points, master_category_id)
  VALUES (p_user_id, p_level, p_flash_points, p_master_category_id)
  ON CONFLICT (user_id) DO UPDATE
  SET level = EXCLUDED.level,
      flash_points = EXCLUDED.flash_points,
      master_category_id = EXCLUDED.master_category_id,
      joined_at = CURRENT_TIMESTAMP;

  RETURN QUERY SELECT true, false, NULL::uuid, NULL::uuid, NULL::text, NULL::integer, NULL::text, NULL::text;
END;
$$ LANGUAGE plpgsql;
