# 🔐 System Ról Użytkowników - Dokumentacja

## 📊 Struktura Ról

### 1. **GUEST** (Gość - Niezalogowany)
**Dostęp:**
- ✅ Strona główna `/` - wersja DEMO z CTA do rejestracji
- ✅ Strona logowania `/login`
- ✅ Strona rejestracji `/register`

**Ograniczenia:**
- ❌ Brak dostępu do rankingów
- ❌ Brak dostępu do misji
- ❌ Brak dostępu do czatu
- ❌ Brak dostępu do sklepu
- ❌ Brak możliwości grania

**Sidebar:**
- Tylko link do "Start"
- Duży CTA z przyciskami "Zaloguj się" i "Zarejestruj się"

---

### 2. **USER** (Zalogowany Użytkownik)
**Dostęp:**
- ✅ Wszystkie strony **oprócz** Panelu Admina
- ✅ Pełny dostęp do gier i funkcji

**Sidebar:**
- Start
- Ranking
- Misje Codziennie
- Historia Gier
- Sklep Punktów
- Moi Znajomi
- Szukaj Znajomych
- Czat
- Najlepsi
- Dodaj Pytanie
- Ustawienia

---

### 3. **ADMIN** (Administrator)
**Dostęp:**
- ✅ **WSZYSTKIE** strony
- ✅ Dodatkowo Panel Admina `/admin`

**Sidebar:**
- Wszystko co USER +
- 🛡️ Panel Admina

---

## 🔧 Implementacja Techniczna

### AuthContext
```typescript
isGuest: boolean  // !user
isUser: boolean   // !!user && !user.is_admin
isAdmin: boolean  // !!user && user.is_admin
```

### Komponenty Route

#### ProtectedRoute
- Wymaga zalogowania
- `requireAdmin={true}` - wymaga roli admina
- Przekierowuje gości do `/login`
- Przekierowuje userów (bez admin) z tras admin do `/`

#### GuestRoute
- Tylko dla niezalogowanych
- Przekierowuje zalogowanych użytkowników do `/`
- Używane dla `/login` i `/register`

---

## 🧪 Testowanie

### Test 1: Gość (Niezalogowany)
1. Wyloguj się (jeśli jesteś zalogowany)
2. Przejdź do `/` - powinieneś zobaczyć wersję DEMO
3. Sidebar pokazuje tylko "Start" + CTA
4. Próba wejścia na `/ranking` → przekierowanie do `/login`
5. Próba wejścia na `/admin` → przekierowanie do `/login`

### Test 2: User (Zwykły Użytkownik)
1. Zarejestruj nowe konto
2. Powinieneś być automatycznie zalogowany
3. Sidebar pokazuje wszystkie linki oprócz "Panel Admina"
4. Możesz wejść na wszystkie strony oprócz `/admin`
5. Próba wejścia na `/admin` → przekierowanie do `/`
6. Próba wejścia na `/login` → przekierowanie do `/`

### Test 3: Admin
1. W Supabase → Table Editor → `users`
2. Znajdź swojego użytkownika i ustaw `is_admin = true`
3. Odśwież stronę
4. Sidebar pokazuje dodatkowo "🛡️ Panel Admina"
5. Możesz wejść na `/admin`

---

## 📝 Jak nadać komuś uprawnienia admina?

### Opcja 1: Przez Supabase Dashboard
1. Otwórz: https://app.supabase.com/project/hgjknetpixnvidfrqygc/editor
2. Kliknij tabelę `users`
3. Znajdź użytkownika
4. Kliknij na pole `is_admin` i zmień na `true`
5. Zapisz

### Opcja 2: Przez SQL
```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'twoj@email.com';
```

### Opcja 3: Podczas rejestracji pierwszego użytkownika
Dodaj w kodzie automatyczne nadanie admina pierwszemu użytkownikowi:
```sql
-- W database-setup.sql można dodać trigger lub manual update
UPDATE users 
SET is_admin = true 
WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);
```

---

## 🎯 Co zostało zaimplementowane:

✅ **AuthContext** - role: isGuest, isUser, isAdmin  
✅ **ProtectedRoute** - wymaga logowania + opcjonalnie admin  
✅ **GuestRoute** - tylko dla niezalogowanych  
✅ **Routing** - wszystkie strony zabezpieczone odpowiednimi wrapperami  
✅ **Sidebar** - różne linki dla różnych ról  
✅ **Home** - wersja DEMO dla gości, pełna wersja dla userów  
✅ **Navbar** - różne przyciski dla zalogowanych/niezalogowanych  

---

## 🚀 Następne kroki:

- [ ] Dodać RLS (Row Level Security) w Supabase
- [ ] Zaimplementować middleware API sprawdzające role
- [ ] Dodać audit log dla akcji adminów
- [ ] Stworzyć panel zarządzania użytkownikami dla adminów
- [ ] Dodać możliwość banowania użytkowników
