-- ========================================
-- ENABLE REALTIME FOR DUEL SYSTEM
-- ========================================

-- Włącz realtime dla duel_matches
ALTER PUBLICATION supabase_realtime ADD TABLE duel_matches;

-- Włącz realtime dla duel_rounds
ALTER PUBLICATION supabase_realtime ADD TABLE duel_rounds;

-- Włącz realtime dla duel_answers
ALTER PUBLICATION supabase_realtime ADD TABLE duel_answers;

-- ========================================
-- KONIEC
-- ========================================
