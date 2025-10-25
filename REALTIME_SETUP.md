# Real-time Setup dla Supabase

## Włączenie Realtime dla tabel (FREE TIER)

Replication to funkcja premium, ale **Publications (Realtime)** jest dostępny w darmowym planie!

### Metoda 1: SQL Editor (Najszybsza)

1. Wejdź do Supabase Dashboard
2. Przejdź do **SQL Editor**
3. Uruchom plik `database/enable-realtime.sql` LUB skopiuj i wklej:

```sql
-- Włącz Realtime dla messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Włącz Realtime dla friendships
ALTER PUBLICATION supabase_realtime ADD TABLE friendships;

-- Sprawdź czy działa
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

4. Kliknij **RUN** (lub Ctrl+Enter)
5. Sprawdź wyniki - powinny być widoczne tabele `messages` i `friendships`

### Metoda 2: Database → Publications (UI)

1. Wejdź do Supabase Dashboard
2. Przejdź do **Database** → **Publications**
3. Znajdź publikację `supabase_realtime`
4. Kliknij **Edit** lub ikonę ołówka
5. Dodaj tabele:
   - ✅ `messages`
   - ✅ `friendships`
6. Zapisz zmiany

### ⚠️ Ważne: Sprawdź RLS policies

Realtime wymaga uprawnień **SELECT** na tabelach. Sprawdź czy masz polityki RLS:

```sql
-- Dla messages - użytkownik powinien móc czytać swoje wiadomości
SELECT * FROM messages 
WHERE receiver_id = auth.uid() OR sender_id = auth.uid();

-- Dla friendships - użytkownik powinien móc czytać swoje zaproszenia
SELECT * FROM friendships 
WHERE user_id = auth.uid() OR friend_id = auth.uid();
```

Jeśli nie działają, dodaj/sprawdź polityki RLS w pliku `database/fix-all-rls-policies.sql`

Po włączeniu Realtime:

1. Otwórz aplikację w dwóch przeglądarkach/kartach
2. Zaloguj się na różne konta
3. Wyślij wiadomość z jednego konta
4. **W konsoli drugiego użytkownika (F12)** powinieneś zobaczyć:
   ```
   📡 Subscription status: SUBSCRIBED
   📨 Nowa wiadomość: {payload}
   📨 Nowa wiadomość - odświeżam licznik sidebar
   ```
5. Sprawdź czy:
   - ✅ Wiadomość pojawia się natychmiast w czacie
   - ✅ Badge z liczbą pojawia się przy "Czat"
   - ✅ Ikona dzwonka zmienia się na unread
   - ✅ Powiadomienie w dropdown

### Troubleshooting

**Problem: "Subscription status: CHANNEL_ERROR"**
```
→ Tabele nie są w publikacji supabase_realtime
→ Uruchom database/enable-realtime.sql
```

**Problem: "Subscription status: SUBSCRIBED" ale brak zdarzeń**
```
→ Sprawdź polityki RLS (użytkownik musi mieć SELECT)
→ Sprawdź filtry receiver_id=eq.{userId}
```

**Problem: "relation does not exist"**
```
→ Tabele nie istnieją, uruchom database/complete-setup.sql
```

### Sprawdzenie konfiguracji

```sql
-- Sprawdź publikację
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- Sprawdź tabele w publikacji
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```
