# System Czatu - Bezpieczeństwo i Optymalizacja

## 🔒 Zabezpieczenia

### 1. **Row Level Security (RLS)**
- ✅ Użytkownicy widzą tylko swoje wiadomości (jako nadawca lub odbiorca)
- ✅ Można wysyłać wiadomości **tylko do znajomych** (sprawdzenie w friendships)
- ✅ Nie można podszyć się pod innego użytkownika (auth.uid() w policies)

### 2. **Rate Limiting**
- ⏱️ Max **20 wiadomości na minutę** na użytkownika
- 🛡️ Zapobiega spamowaniu
- 💾 Tracking w pamięci aplikacji (Map)

### 3. **Filtrowanie Treści**
- 🚫 Blokada wulgaryzmów (lista w `BLOCKED_WORDS`)
- ✂️ Max **1000 znaków** na wiadomość
- 🤖 Detekcja spamu (powtarzające się znaki: `aaaaaaaaaaaa`)
- ✅ Trim białych znaków

### 4. **Walidacja Znajomości**
```typescript
// Przed wysłaniem sprawdzamy czy są znajomymi
const areFriends = await checkFriendship(senderId, receiverId);
if (!areFriends) {
  return { error: 'Możesz wysyłać wiadomości tylko do znajomych' };
}
```

### 5. **SQL Injection Protection**
- ✅ Używamy Supabase parametryzowanych zapytań
- ✅ Brak raw SQL w aplikacji
- ✅ RLS wymusza uprawnienia na poziomie bazy

---

## 📦 Optymalizacja Przechowywania

### Limit Wiadomości
- 💾 **100 wiadomości na konwersację** (automatyczne usuwanie)
- 🗑️ Trigger `messages_cleanup` usuwa starsze po INSERT
- ⚡ Zmniejsza obciążenie bazy i czas ładowania

### Automatyczne Czyszczenie
```sql
-- Po każdej nowej wiadomości
CREATE TRIGGER messages_cleanup
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION trigger_cleanup_messages();
```

Funkcja `trigger_cleanup_messages()`:
1. Pobiera wszystkie wiadomości w konwersacji
2. Sortuje po dacie (najnowsze najpierw)
3. Usuwa wszystkie poza 100 najnowszymi

### Manualne Czyszczenie (Admin)
```sql
-- Funkcja dla administratora
SELECT cleanup_old_messages();
```

---

## 🚀 Realtime

### Subskrypcja na nowe wiadomości
```typescript
subscribeToMessages(userId, friendId, (newMessage) => {
  // Automatycznie dodaj do listy
  setMessages(prev => [...prev, newMessage]);
});
```

- 📡 Supabase Realtime Channels
- ⚡ Instant delivery (WebSocket)
- 🔔 Automatyczne oznaczanie jako przeczytane

---

## 📊 Statystyki i Monitoring

### Nieprzeczytane Wiadomości
```typescript
const unreadCount = await getTotalUnreadCount(userId);
```

### Status Online
- 🟢 Online: last_login < 5 minut temu
- ⚫ Offline: last_login > 5 minut temu

---

## 🛠️ Rozszerzenia (Przyszłość)

### Planowane funkcje:
1. **Emoji Reactions** - reagowanie na wiadomości
2. **Attachments** - wysyłanie zdjęć (Supabase Storage)
3. **Voice Messages** - nagrywanie głosowe
4. **Typing Indicator** - "XYZ pisze..."
5. **Message Editing** - edycja wysłanych wiadomości (5 min)
6. **Message Deletion** - usuwanie dla obu stron
7. **Read Receipts** - potwierdzenia przeczytania
8. **Push Notifications** - powiadomienia push

### Blokowanie użytkowników:
```typescript
await blockUser(userId, blockedUserId);
// 1. Zmienia status friendship na 'blocked'
// 2. Usuwa wszystkie wiadomości między nimi
// 3. Blokuje przyszłą komunikację
```

---

## 🔐 Najlepsze Praktyki

### Frontend
- ✅ Zawsze waliduj dane przed wysłaniem
- ✅ Pokazuj komunikaty o błędach użytkownikowi
- ✅ Implementuj debouncing dla typing indicators
- ✅ Używaj optimistic updates (dodaj wiadomość od razu, potem potwierdź)

### Backend (Supabase)
- ✅ RLS policies na wszystkich tabelach
- ✅ Indexes na często używanych kolumnach
- ✅ Constraints na poziomie bazy (długość, unique, foreign keys)
- ✅ Triggers dla automatyzacji (cleanup, timestamps)

### Bezpieczeństwo
- ✅ Nigdy nie ufaj danym z frontendu
- ✅ Zawsze waliduj uprawnienia w RLS
- ✅ Loguj podejrzane aktywności (spam, rate limit violations)
- ✅ Regularnie aktualizuj listę BLOCKED_WORDS

---

## 📝 Konfiguracja

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase Setup
1. Utwórz tabelę: `database/create-messages-table.sql`
2. Włącz Realtime dla tabeli `messages`:
   - Settings → Database → Replication → Enable for `messages`
3. Sprawdź czy RLS jest włączony

### Rate Limiting
Dostosuj w `messageService.ts`:
```typescript
const RATE_LIMIT = 20; // wiadomości
const RATE_WINDOW_MS = 60000; // 1 minuta
```

### Message Limit
Zmień liczbę przechowywanych wiadomości w SQL:
```sql
-- W funkcji trigger_cleanup_messages()
OFFSET 100  -- Zmień na dowolną liczbę
```

---

## 🐛 Troubleshooting

### "Nie możesz wysłać wiadomości do tego użytkownika"
- Sprawdź czy są znajomymi w tabeli `friendships`
- Sprawdź RLS policies w Supabase Dashboard

### "Wysyłasz wiadomości zbyt szybko"
- Rate limit: 20 msg/min
- Poczekaj 1 minutę i spróbuj ponownie

### Wiadomości nie pojawiają się w realtime
- Sprawdź czy Realtime jest włączony dla tabeli `messages`
- Sprawdź logi konsoli w przeglądarce
- Verify WebSocket connection w Network tab

### Stare wiadomości nie są usuwane
- Sprawdź czy trigger `messages_cleanup` jest aktywny
- Manualne wywołanie: `SELECT cleanup_old_messages();`

---

## 📚 Dokumentacja API

### `sendMessage(senderId, receiverId, content)`
Wysyła wiadomość z walidacją i zabezpieczeniami.

**Returns:** `{ success: boolean, error?: string, message?: Message }`

### `getMessages(userId, friendId, limit?)`
Pobiera ostatnie wiadomości (max 100).

**Returns:** `Promise<MessageWithUser[]>`

### `markAsRead(userId, friendId)`
Oznacza wszystkie wiadomości od znajomego jako przeczytane.

### `subscribeToMessages(userId, friendId, callback)`
Subskrybuje nowe wiadomości w realtime.

**Returns:** `() => void` (unsubscribe function)

### `deleteConversation(userId, friendId)`
Usuwa konwersację (tylko wiadomości wysłane przez userId).

### `blockUser(userId, blockedUserId)`
Blokuje użytkownika i usuwa wszystkie wiadomości.

---

Stworzone: 25 października 2025
Wersja: 1.0.0
