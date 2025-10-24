-- ============================================
-- FUNKCJE POMOCNICZE DLA SYSTEMU PROFILI
-- ============================================

-- Funkcja do zwiększania licznika odwiedzin profilu
CREATE OR REPLACE FUNCTION increment_profile_views(profile_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET profile_views = profile_views + 1
  WHERE user_id = profile_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funkcja do automatycznej dezaktywacji wygasłych boosterów
CREATE OR REPLACE FUNCTION deactivate_expired_boosters()
RETURNS void AS $$
BEGIN
  UPDATE user_inventory
  SET is_active = false
  WHERE is_active = true
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Scheduler do automatycznej dezaktywacji boosterów (wywołuj co godzinę lub przy logowaniu)
-- W prawdziwej aplikacji użyj pg_cron lub wywołaj z aplikacji

COMMENT ON FUNCTION increment_profile_views IS 'Zwiększa licznik odwiedzin profilu użytkownika';
COMMENT ON FUNCTION deactivate_expired_boosters IS 'Dezaktywuje wygasłe boostery';
