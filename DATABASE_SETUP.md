# 🗄️ Konfiguracja Bazy Danych

## 🚨 Problem
Aplikacja nie wyświetla pytań w quizie, ponieważ **baza danych Supabase jest pusta**. 

W konsoli widzisz:
```
⚠️ Using fallback questions (XX questions)
```

Zamiast:
```
✅ Received questions: 50
```

---

## ✅ Rozwiązanie

### Opcja 1: Szybki setup (ZALECANE) 🚀

Użyj **`quick-setup.sql`** - bezpieczny, nie usuwa istniejących danych:

1. Otwórz **Supabase Dashboard** → Twój projekt
2. Idź do **SQL Editor** (ikona ⚡ w menu)
3. Kliknij **"+ New query"**
4. Skopiuj całą zawartość pliku **`database/quick-setup.sql`**
5. Wklej do edytora SQL
6. Kliknij **"Run"** (lub `Cmd+Enter`)

**Zalety:**
- ✅ Używa `ON CONFLICT DO NOTHING` - bezpieczne
- ✅ Nie usuwa istniejących gier
- ✅ Dodaje dane tylko jeśli ich brakuje

---

### Opcja 2: Pełny reset (jeśli masz problemy) 🔧

Użyj **`complete-setup.sql`** - usuwa wszystkie dane i zaczyna od nowa:

⚠️ **UWAGA:** Ten skrypt usunie wszystkie gry, statystyki i dane użytkowników!

1. Otwórz **Supabase Dashboard** → Twój projekt
2. Idź do **SQL Editor**
3. Skopiuj całą zawartość pliku **`database/complete-setup.sql`**
4. Wklej do edytora SQL
5. Kliknij **"Run"**

**Zalety:**
- ✅ Czyści bazę kompletnie
- ✅ Naprawia RLS policies
- ✅ Dodaje wszystkie dane

**Wady:**
- ❌ Usuwa istniejące gry
- ❌ Usuwa statystyki użytkowników
