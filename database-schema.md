# Database Schema - React Quiz Game

## Analiza funkcjonalności

Na podstawie interfejsu użytkownika, aplikacja wymaga obsługi:

### Główne funkcje:
1. **Tryby gry**: Duel (1v1), Squad (2v2), Blitz (3 życia + czas), Master (kategoria)
2. **System punktów**: Flash Points - waluta w grze
3. **Ranking**: Globalne zestawienie graczy
4. **Znajomi**: Wyszukiwanie, dodawanie, ranking znajomych
5. **Czat**: Komunikacja między graczami
6. **Misje dzienne**: Codzienne wyzwania
7. **Osiągnięcia**: System achievementów
8. **Wyzwania**: Gracz vs gracz
9. **Historia gier**: Archiwum rozegranych partii
10. **Statystyki**: Gry zagrane, accuracy, streak, poziom
11. **Sklep punktów**: Zakup premiumowych elementów
12. **Pytania**: System dodawania pytań przez użytkowników
13. **Kategorie**: Tematyczne zestawy pytań

---

## Proposed Database Schema

### 1. **users**
Główna tabela użytkowników

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) DEFAULT 'guest_avatar.png',
    flash_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    experience_to_next_level INTEGER DEFAULT 100, -- XP needed for next level
    total_games_played INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    total_correct_answers INTEGER DEFAULT 0,
    total_questions_answered INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    rank_position INTEGER,
    is_premium BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    -- Constraints
    CHECK (flash_points >= 0),
    CHECK (level >= 1),
    CHECK (experience >= 0),
    CHECK (experience < experience_to_next_level)
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_rank ON users(rank_position);
CREATE INDEX idx_users_flash_points ON users(flash_points DESC);
CREATE INDEX idx_users_level ON users(level DESC, experience DESC);
```

**Experience System:**
- **Win rewards**: 
  - Base XP: 50 per win
  - Bonus for streak: +10 XP per consecutive win
  - Bonus for perfect game: +25 XP (100% accuracy)
- **Loss penalties**:
  - Lose 20 XP per loss (cannot go below 0 in current level)
- **Level progression**:
  - Level 1→2: 100 XP
  - Each level: XP requirement increases by 50
  - Formula: `100 + (level - 1) * 50`
  - Example: Level 10 requires 550 XP to advance to 11
```

### 2. **categories**
Kategorie pytań

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon_emoji VARCHAR(10),
    description TEXT,
    question_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(name)
);

-- Indexes
CREATE INDEX idx_categories_active ON categories(is_active);
```

### 3. **questions**
Pytania quizowe

```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    wrong_answer_1 TEXT NOT NULL,
    wrong_answer_2 TEXT NOT NULL,
    wrong_answer_3 TEXT NOT NULL,
    difficulty_level VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
    points_value INTEGER DEFAULT 10,
    submitted_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    times_answered INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    CHECK (points_value > 0)
);

-- Indexes
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_approved ON questions(is_approved, is_active);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX idx_questions_submitted_by ON questions(submitted_by_user_id);
```

### 4. **game_modes**
Dostępne tryby gry

```sql
CREATE TABLE game_modes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL, -- 'duel', 'squad', 'blitz', 'master'
    name VARCHAR(50) NOT NULL,
    description TEXT,
    min_players INTEGER NOT NULL,
    max_players INTEGER NOT NULL,
    time_limit_seconds INTEGER,
    lives_count INTEGER,
    requires_category BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    CHECK (min_players > 0),
    CHECK (max_players >= min_players)
);

-- Insert default game modes
INSERT INTO game_modes (code, name, description, min_players, max_players, time_limit_seconds, lives_count, requires_category) VALUES
('duel', 'Duel', '1v1 - kto jest lepszy?', 2, 2, NULL, NULL, FALSE),
('squad', 'Squad', '2v2 drużynowa dominacja', 4, 4, NULL, NULL, FALSE),
('blitz', 'Blitz', '3 życia i walka na czas', 1, 1, 180, 3, FALSE),
('master', 'Master', 'Sprawdź się w pojedynku w jednej kategorii', 2, 2, NULL, NULL, TRUE);
```

### 5. **games**
Historia rozegranych gier

```sql
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_mode_id INTEGER REFERENCES game_modes(id),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, completed, cancelled
    winner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    total_questions INTEGER DEFAULT 10,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    
    CHECK (status IN ('pending', 'active', 'completed', 'cancelled'))
);

-- Indexes
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_mode ON games(game_mode_id);
CREATE INDEX idx_games_started ON games(started_at DESC);
```

### 6. **game_participants**
Gracze biorący udział w grze

```sql
CREATE TABLE game_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_number INTEGER DEFAULT 1, -- 1 lub 2 dla Squad
    score INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    lives_remaining INTEGER,
    placement INTEGER, -- 1 = winner, 2 = second place, etc.
    flash_points_earned INTEGER DEFAULT 0,
    experience_earned INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(game_id, user_id),
    CHECK (team_number IN (1, 2)),
    CHECK (score >= 0)
);

-- Indexes
CREATE INDEX idx_game_participants_game ON game_participants(game_id);
CREATE INDEX idx_game_participants_user ON game_participants(user_id);
```

### 7. **game_questions**
Pytania zadane w konkretnej grze

```sql
CREATE TABLE game_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    
    UNIQUE(game_id, question_order)
);

-- Indexes
CREATE INDEX idx_game_questions_game ON game_questions(game_id);
```

### 8. **game_answers**
Odpowiedzi graczy na pytania

```sql
CREATE TABLE game_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer_given TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(game_id, user_id, question_id)
);

-- Indexes
CREATE INDEX idx_game_answers_game ON game_answers(game_id);
CREATE INDEX idx_game_answers_user ON game_answers(user_id);
```

### 9. **friendships**
Relacje znajomości między użytkownikami

```sql
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    
    CHECK (user_id != friend_id),
    CHECK (status IN ('pending', 'accepted', 'blocked')),
    UNIQUE(user_id, friend_id)
);

-- Indexes
CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_status ON friendships(status);
```

### 10. **chat_conversations**
Konwersacje czatu

```sql
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_type VARCHAR(20) DEFAULT 'direct', -- direct, group
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,
    
    CHECK (conversation_type IN ('direct', 'group'))
);
```

### 11. **chat_participants**
Uczestnicy konwersacji

```sql
CREATE TABLE chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    
    UNIQUE(conversation_id, user_id)
);

-- Indexes
CREATE INDEX idx_chat_participants_conversation ON chat_participants(conversation_id);
CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);
```

### 12. **chat_messages**
Wiadomości czatu

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (LENGTH(message_text) <= 2000)
);

-- Indexes
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id, sent_at DESC);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
```

### 13. **achievements**
Definicje osiągnięć

```sql
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_emoji VARCHAR(10),
    requirement_type VARCHAR(50), -- total_games, streak, accuracy, level, category_master
    requirement_value INTEGER,
    flash_points_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example achievements
INSERT INTO achievements (code, name, description, icon_emoji, requirement_type, requirement_value, flash_points_reward) VALUES
('first_win', 'Pierwsza Wygrana', 'Wygraj swoją pierwszą grę', '🏆', 'total_wins', 1, 50),
('streak_5', 'Hot Streak', 'Osiągnij serię 5 wygranych', '🔥', 'streak', 5, 100),
('master_100', 'Setka Gier', 'Zagraj 100 gier', '💯', 'total_games', 100, 200);
```

### 14. **user_achievements**
Osiągnięcia użytkowników

```sql
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_new BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_new ON user_achievements(user_id, is_new);
```

### 15. **daily_missions**
Definicje misji dziennych

```sql
CREATE TABLE daily_missions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    mission_type VARCHAR(50), -- play_games, win_games, answer_correct, use_category
    target_value INTEGER NOT NULL,
    flash_points_reward INTEGER DEFAULT 0,
    experience_reward INTEGER DEFAULT 0,
    valid_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    CHECK (target_value > 0)
);

-- Indexes
CREATE INDEX idx_daily_missions_date ON daily_missions(valid_date, is_active);
```

### 16. **user_daily_missions**
Postęp użytkowników w misjach dziennych

```sql
CREATE TABLE user_daily_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mission_id INTEGER REFERENCES daily_missions(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    
    UNIQUE(user_id, mission_id),
    CHECK (current_progress >= 0)
);

-- Indexes
CREATE INDEX idx_user_missions_user ON user_daily_missions(user_id);
CREATE INDEX idx_user_missions_completed ON user_daily_missions(user_id, is_completed);
```

### 17. **challenges**
Wyzwania między graczami

```sql
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenger_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenged_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_mode_id INTEGER REFERENCES game_modes(id),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, completed
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    game_id UUID REFERENCES games(id) ON DELETE SET NULL,
    
    CHECK (challenger_id != challenged_id),
    CHECK (status IN ('pending', 'accepted', 'declined', 'completed'))
);

-- Indexes
CREATE INDEX idx_challenges_challenger ON challenges(challenger_id);
CREATE INDEX idx_challenges_challenged ON challenges(challenged_id, status);
```

### 18. **shop_items**
Przedmioty w sklepie punktów

```sql
CREATE TABLE shop_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    item_type VARCHAR(50), -- avatar, badge, boost, theme
    price_flash_points INTEGER NOT NULL,
    icon_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    is_premium_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (price_flash_points > 0)
);

-- Indexes
CREATE INDEX idx_shop_items_available ON shop_items(is_available);
CREATE INDEX idx_shop_items_type ON shop_items(item_type);
```

### 19. **user_purchases**
Historia zakupów użytkowników

```sql
CREATE TABLE user_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shop_item_id INTEGER REFERENCES shop_items(id) ON DELETE CASCADE,
    flash_points_spent INTEGER NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    CHECK (flash_points_spent > 0)
);

-- Indexes
CREATE INDEX idx_user_purchases_user ON user_purchases(user_id);
CREATE INDEX idx_user_purchases_date ON user_purchases(purchased_at DESC);
```

### 20. **notifications**
Powiadomienia użytkowników

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50), -- friend_request, challenge, achievement, game_invite
    title VARCHAR(200) NOT NULL,
    message TEXT,
    related_id UUID, -- ID powiązanego obiektu (game, challenge, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (notification_type IN ('friend_request', 'challenge', 'achievement', 'game_invite', 'message', 'system'))
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

---

## Relacje i kluczowe zapytania

### Najważniejsze relacje:
1. **users ↔ games** (przez game_participants) - kto grał w jakie gry
2. **games → questions** (przez game_questions) - jakie pytania były w grze
3. **users ↔ users** (friendships) - znajomości
4. **users → achievements** (user_achievements) - zdobyte osiągnięcia
5. **users → daily_missions** (user_daily_missions) - postęp w misjach
6. **users ↔ challenges** - wyzwania między graczami
7. **users → chat** (przez conversations/participants) - czat

### Przykładowe zapytania:

```sql
-- Ranking globalny
SELECT u.username, u.flash_points, u.level, u.total_games_played, u.rank_position
FROM users u
ORDER BY u.flash_points DESC, u.level DESC
LIMIT 100;

-- Ranking znajomych
SELECT u.username, u.flash_points, u.level, u.avatar_url
FROM users u
JOIN friendships f ON (f.friend_id = u.id AND f.user_id = $1)
WHERE f.status = 'accepted'
ORDER BY u.flash_points DESC
LIMIT 10;

-- Accuracy użytkownika
SELECT 
    (total_correct_answers::float / NULLIF(total_questions_answered, 0) * 100) as accuracy
FROM users
WHERE id = $1;

-- Historia gier użytkownika
SELECT g.id, gm.name as mode, g.started_at, g.ended_at,
       gp.score, gp.correct_answers, gp.placement,
       gp.flash_points_earned
FROM games g
JOIN game_participants gp ON g.id = gp.game_id
JOIN game_modes gm ON g.game_mode_id = gm.id
WHERE gp.user_id = $1
ORDER BY g.started_at DESC;

-- Nowe osiągnięcia użytkownika
SELECT a.name, a.description, a.icon_emoji, ua.unlocked_at
FROM user_achievements ua
JOIN achievements a ON ua.achievement_id = a.id
WHERE ua.user_id = $1 AND ua.is_new = TRUE
ORDER BY ua.unlocked_at DESC;

-- Aktywne misje dzienne
SELECT dm.*, udm.current_progress, udm.is_completed
FROM daily_missions dm
LEFT JOIN user_daily_missions udm ON (dm.id = udm.mission_id AND udm.user_id = $1)
WHERE dm.valid_date = CURRENT_DATE AND dm.is_active = TRUE;

-- Oczekujące wyzwania
SELECT c.*, u.username as challenger_name, u.avatar_url as challenger_avatar,
       gm.name as game_mode_name
FROM challenges c
JOIN users u ON c.challenger_id = u.id
JOIN game_modes gm ON c.game_mode_id = gm.id
WHERE c.challenged_id = $1 AND c.status = 'pending'
ORDER BY c.created_at DESC;
```

---

## Technologie rekomendowane

### Backend:
- **PostgreSQL 15+** - główna baza danych
- **Redis** - cache dla rankingów, sesji gier
- **Node.js + Express/Fastify** lub **Python + FastAPI**
- **Socket.io** - real-time czat i live games

### Optymalizacje:
1. **Materialized views** dla rankingów (odświeżane co 5 min)
2. **Partycjonowanie** tabeli `game_answers` po dacie
3. **Full-text search** dla wyszukiwania znajomych
4. **Connection pooling** (pgBouncer)
5. **Read replicas** dla ciężkich zapytań analitycznych

### Bezpieczeństwo:
1. Password hashing: **bcrypt** lub **argon2**
2. JWT tokens dla autoryzacji
3. Rate limiting na API
4. Input validation i sanitization
5. Row-level security w PostgreSQL

---

## Uwagi końcowe

Schema jest zaprojektowana z myślą o:
- **Skalowalności** - UUID jako primary keys, możliwość shardingu
- **Performance** - odpowiednie indeksy, denormalizacja statystyk w tabeli users
- **Integralności danych** - foreign keys, constraints, check constraints
- **Rozszerzalności** - łatwo dodać nowe typy gier, osiągnięć, przedmiotów

Schemat obsługuje wszystkie funkcje widoczne w UI i jest gotowy do implementacji.
