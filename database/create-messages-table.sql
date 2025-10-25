-- =============================================
-- Tabela: messages
-- Opis: Wiadomości prywatne między użytkownikami
-- =============================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Użytkownicy
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Treść wiadomości
  content TEXT NOT NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT different_users CHECK (sender_id != receiver_id),
  CONSTRAINT content_length CHECK (char_length(content) > 0 AND char_length(content) <= 1000)
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Trigger dla updated_at
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_messages_updated_at();

-- RLS (Row Level Security)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Użytkownik widzi wiadomości gdzie jest nadawcą lub odbiorcą
CREATE POLICY "Users can view their own messages"
ON messages
FOR SELECT
USING (
  auth.uid()::uuid = sender_id OR 
  auth.uid()::uuid = receiver_id
);

-- Policy: Użytkownik może wysłać wiadomość
CREATE POLICY "Users can send messages"
ON messages
FOR INSERT
WITH CHECK (
  auth.uid()::uuid = sender_id AND
  -- Sprawdź czy są znajomymi
  EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND (
      (user_id = auth.uid()::uuid AND friend_id = receiver_id) OR
      (friend_id = auth.uid()::uuid AND user_id = receiver_id)
    )
  )
);

-- Policy: Użytkownik może zaktualizować swoje wiadomości (np. oznaczyć jako przeczytane)
CREATE POLICY "Users can update their received messages"
ON messages
FOR UPDATE
USING (auth.uid()::uuid = receiver_id)
WITH CHECK (auth.uid()::uuid = receiver_id);

-- Policy: Użytkownik może usunąć swoje wysłane wiadomości
CREATE POLICY "Users can delete their sent messages"
ON messages
FOR DELETE
USING (auth.uid()::uuid = sender_id);

-- Funkcja: Automatyczne usuwanie starych wiadomości (zostawia ostatnie 100 na konwersację)
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void AS $$
DECLARE
  conv RECORD;
BEGIN
  -- Dla każdej pary użytkowników
  FOR conv IN 
    SELECT DISTINCT 
      LEAST(sender_id, receiver_id) as user1,
      GREATEST(sender_id, receiver_id) as user2
    FROM messages
  LOOP
    -- Usuń wiadomości starsze niż 100 ostatnich
    DELETE FROM messages
    WHERE id IN (
      SELECT id FROM messages
      WHERE (
        (sender_id = conv.user1 AND receiver_id = conv.user2) OR
        (sender_id = conv.user2 AND receiver_id = conv.user1)
      )
      ORDER BY created_at DESC
      OFFSET 100
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funkcja: Rate limiting - sprawdź czy użytkownik nie spamuje
CREATE OR REPLACE FUNCTION check_message_rate_limit(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  message_count INTEGER;
BEGIN
  -- Policz wiadomości z ostatniej minuty
  SELECT COUNT(*) INTO message_count
  FROM messages
  WHERE sender_id = user_id
    AND created_at > NOW() - INTERVAL '1 minute';
  
  -- Max 20 wiadomości na minutę
  RETURN message_count < 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Cleanup starych wiadomości po INSERT
CREATE OR REPLACE FUNCTION trigger_cleanup_messages()
RETURNS TRIGGER AS $$
BEGIN
  -- Usuń stare wiadomości tej konwersacji (zostawia ostatnie 100)
  DELETE FROM messages
  WHERE id IN (
    SELECT id FROM messages
    WHERE (
      (sender_id = NEW.sender_id AND receiver_id = NEW.receiver_id) OR
      (sender_id = NEW.receiver_id AND receiver_id = NEW.sender_id)
    )
    ORDER BY created_at DESC
    OFFSET 100
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_cleanup
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION trigger_cleanup_messages();

-- Funkcja helper: Pobierz ostatnią wiadomość w konwersacji
CREATE OR REPLACE FUNCTION get_last_message(user1_id UUID, user2_id UUID)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  receiver_id UUID,
  content TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.sender_id,
    m.receiver_id,
    m.content,
    m.is_read,
    m.created_at
  FROM messages m
  WHERE 
    (m.sender_id = user1_id AND m.receiver_id = user2_id) OR
    (m.sender_id = user2_id AND m.receiver_id = user1_id)
  ORDER BY m.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funkcja helper: Liczba nieprzeczytanych wiadomości
CREATE OR REPLACE FUNCTION get_unread_count(for_user_id UUID, from_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM messages
    WHERE receiver_id = for_user_id
      AND sender_id = from_user_id
      AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Komentarze
COMMENT ON TABLE messages IS 'Prywatne wiadomości między użytkownikami';
COMMENT ON COLUMN messages.sender_id IS 'Użytkownik wysyłający wiadomość';
COMMENT ON COLUMN messages.receiver_id IS 'Użytkownik otrzymujący wiadomość';
COMMENT ON COLUMN messages.content IS 'Treść wiadomości (max 1000 znaków)';
COMMENT ON COLUMN messages.is_read IS 'Czy wiadomość została przeczytana';
COMMENT ON COLUMN messages.read_at IS 'Kiedy wiadomość została przeczytana';
