-- Add columns to store randomized answers for each question
-- This ensures both players see the same answer order
-- Format: {"A": "answer text", "B": "answer text", "C": "answer text", "D": "answer text", "correct": "A"}

ALTER TABLE duel_rounds
ADD COLUMN IF NOT EXISTS answers_q1 jsonb,
ADD COLUMN IF NOT EXISTS answers_q2 jsonb,
ADD COLUMN IF NOT EXISTS answers_q3 jsonb;

COMMENT ON COLUMN duel_rounds.answers_q1 IS 'Randomized answers for question 1. Format: {"A": "text", "B": "text", "C": "text", "D": "text", "correct": "A"}';
COMMENT ON COLUMN duel_rounds.answers_q2 IS 'Randomized answers for question 2';
COMMENT ON COLUMN duel_rounds.answers_q3 IS 'Randomized answers for question 3';
