# 🔐 Konfiguracja Supabase Email Authentication

## ⚠️ WAŻNE - Włącz Email Auth w Supabase!

Żeby logowanie/rejestracja działały, musisz włączyć Email Authentication:

### 1️⃣ Otwórz Supabase Dashboard
```
https://app.supabase.com/project/hgjknetpixnvidfrqygc/auth/providers
```

### 2️⃣ Włącz Email Provider
1. Kliknij **"Email"** w sekcji "Auth Providers"
2. Włącz opcję **"Enable Email provider"**
3. **WYŁĄCZ** opcję **"Confirm email"** (żeby nie wymagać potwierdzenia emaila)
   - To jest WAŻNE - w przeciwnym razie użytkownicy nie będą mogli się od razu zalogować!
4. Kliknij **"Save"**

### 3️⃣ Konfiguracja Site URL (opcjonalne dla developmentu)
W zakładce **"Authentication" → "URL Configuration"**:
- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/**`

## 🧪 Testowanie

### Rejestracja nowego użytkownika:
1. Przejdź do: http://localhost:5173/register
2. Wpisz:
   - Username: `TestPlayer`
   - Email: `test@example.com`
   - Hasło: `test123` (min. 6 znaków)
3. Kliknij "Zarejestruj się"
4. Powinieneś zostać automatycznie zalogowany!

### Logowanie:
1. Przejdź do: http://localhost:5173/login
2. Wpisz email i hasło użytkownika
3. Kliknij "Zaloguj się"

### Sprawdzenie użytkowników:
W Supabase Dashboard → **Authentication** → **Users**
Powinieneś zobaczyć listę zarejestrowanych użytkowników.

## 📊 Co zostało zaimplementowane:

✅ **AuthContext** - zarządzanie sesją użytkownika
✅ **Login page** - formularz logowania z walidacją
✅ **Register page** - formularz rejestracji z walidacją
✅ **Navbar** - pokazuje username i FlashPoints zalogowanego użytkownika
✅ **Logout** - przycisk wylogowania w nawigacji
✅ **Auto-login** - po rejestracji użytkownik jest automatycznie zalogowany
✅ **Session persistence** - sesja jest zachowywana po odświeżeniu strony

## 🔧 Jak to działa:

1. **Rejestracja**:
   - Użytkownik wypełnia formularz (username, email, password)
   - System tworzy konto w Supabase Auth
   - Automatycznie tworzy rekord w tabeli `users` z tym samym ID
   - Użytkownik jest automatycznie zalogowany

2. **Logowanie**:
   - Użytkownik podaje email i hasło
   - Supabase Auth weryfikuje dane
   - System pobiera dane użytkownika z tabeli `users`
   - Zapisuje `last_login` timestamp

3. **Sesja**:
   - AuthContext nasłuchuje zmian w sesji
   - Automatycznie aktualizuje stan po zalogowaniu/wylogowaniu
   - Przechowuje pełne dane użytkownika (username, flash_points, level, etc.)

## 🚀 Następne kroki:

- [ ] Dodać ProtectedRoute dla stron wymagających logowania
- [ ] Zaimplementować edycję profilu
- [ ] Dodać zmianę avatara
- [ ] Zintegrować system nagród (FlashPoints, Experience)
- [ ] Dodać social login (Google, GitHub)
