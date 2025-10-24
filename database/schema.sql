-- ========================================
-- React Quiz Game - Database Setup
-- PostgreSQL Schema for Supabase
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. USERS TABLE
-- ========================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) DEFAULT 'guest_avatar.png',
    flash_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    experience_to_next_level INTEGER DEFAULT 100,
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
    
    CHECK (flash_points >= 0),
    CHECK (level >= 1),
    CHECK (experience >= 0),
    CHECK (experience < experience_to_next_level)
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_rank ON users(rank_position);
CREATE INDEX idx_users_flash_points ON users(flash_points DESC);
CREATE INDEX idx_users_level ON users(level DESC, experience DESC);

-- ========================================
-- 2. CATEGORIES TABLE
-- ========================================

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

CREATE INDEX idx_categories_active ON categories(is_active);

-- Insert default categories
INSERT INTO categories (name, icon_emoji, description) VALUES
('Historia', '📜', 'Pytania historyczne'),
('Geografia', '🌍', 'Geografia świata'),
('Nauka', '🔬', 'Fizyka, chemia, biologia'),
('Sport', '⚽', 'Pytania sportowe'),
('Rozrywka', '🎬', 'Filmy, muzyka, kultura'),
('Technologia', '💻', 'IT i technologie');

-- ========================================
-- 3. QUESTIONS TABLE
-- ========================================

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    wrong_answer_1 TEXT NOT NULL,
    wrong_answer_2 TEXT NOT NULL,
    wrong_answer_3 TEXT NOT NULL,
    difficulty_level VARCHAR(20) DEFAULT 'medium',
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

CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_approved ON questions(is_approved, is_active);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX idx_questions_submitted_by ON questions(submitted_by_user_id);

-- ========================================
-- 4. GAME MODES TABLE
-- ========================================

CREATE TABLE game_modes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
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

-- ========================================
-- 5. GAMES TABLE
-- ========================================

CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_mode_id INTEGER REFERENCES game_modes(id),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending',
    winner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    total_questions INTEGER DEFAULT 10,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    
    CHECK (status IN ('pending', 'active', 'completed', 'cancelled'))
);

CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_mode ON games(game_mode_id);
CREATE INDEX idx_games_started ON games(started_at DESC);

-- ========================================
-- 6. GAME PARTICIPANTS TABLE
-- ========================================

CREATE TABLE game_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_number INTEGER DEFAULT 1,
    score INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    lives_remaining INTEGER,
    placement INTEGER,
    flash_points_earned INTEGER DEFAULT 0,
    experience_earned INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(game_id, user_id),
    CHECK (team_number IN (1, 2)),
    CHECK (score >= 0)
);

CREATE INDEX idx_game_participants_game ON game_participants(game_id);
CREATE INDEX idx_game_participants_user ON game_participants(user_id);

-- ========================================
-- 7. GAME QUESTIONS TABLE
-- ========================================

CREATE TABLE game_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    
    UNIQUE(game_id, question_order)
);

CREATE INDEX idx_game_questions_game ON game_questions(game_id);

-- ========================================
-- 8. GAME ANSWERS TABLE
-- ========================================

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

CREATE INDEX idx_game_answers_game ON game_answers(game_id);
CREATE INDEX idx_game_answers_user ON game_answers(user_id);

-- ========================================
-- 9. FRIENDSHIPS TABLE
-- ========================================

CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    
    CHECK (user_id != friend_id),
    CHECK (status IN ('pending', 'accepted', 'blocked')),
    UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- ========================================
-- 10. CHAT CONVERSATIONS TABLE
-- ========================================

CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_type VARCHAR(20) DEFAULT 'direct',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,
    
    CHECK (conversation_type IN ('direct', 'group'))
);

-- ========================================
-- 11. CHAT PARTICIPANTS TABLE
-- ========================================

CREATE TABLE chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_chat_participants_conversation ON chat_participants(conversation_id);
CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);

-- ========================================
-- 12. CHAT MESSAGES TABLE
-- ========================================

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (LENGTH(message_text) <= 2000)
);

CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id, sent_at DESC);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);

-- ========================================
-- 13. ACHIEVEMENTS TABLE
-- ========================================

CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_emoji VARCHAR(10),
    requirement_type VARCHAR(50),
    requirement_value INTEGER,
    flash_points_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert example achievements
INSERT INTO achievements (code, name, description, icon_emoji, requirement_type, requirement_value, flash_points_reward) VALUES
('first_win', 'Pierwsza Wygrana', 'Wygraj swoją pierwszą grę', '🏆', 'total_wins', 1, 50),
('streak_5', 'Hot Streak', 'Osiągnij serię 5 wygranych', '🔥', 'streak', 5, 100),
('master_100', 'Setka Gier', 'Zagraj 100 gier', '💯', 'total_games', 100, 200);

-- ========================================
-- 14. USER ACHIEVEMENTS TABLE
-- ========================================

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_new BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_new ON user_achievements(user_id, is_new);

-- ========================================
-- 15. DAILY MISSIONS TABLE
-- ========================================

CREATE TABLE daily_missions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    mission_type VARCHAR(50),
    target_value INTEGER NOT NULL,
    flash_points_reward INTEGER DEFAULT 0,
    experience_reward INTEGER DEFAULT 0,
    valid_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    CHECK (target_value > 0)
);

CREATE INDEX idx_daily_missions_date ON daily_missions(valid_date, is_active);

-- ========================================
-- 16. USER DAILY MISSIONS TABLE
-- ========================================

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

CREATE INDEX idx_user_missions_user ON user_daily_missions(user_id);
CREATE INDEX idx_user_missions_completed ON user_daily_missions(user_id, is_completed);

-- ========================================
-- 17. CHALLENGES TABLE
-- ========================================

CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenger_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenged_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_mode_id INTEGER REFERENCES game_modes(id),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    game_id UUID REFERENCES games(id) ON DELETE SET NULL,
    
    CHECK (challenger_id != challenged_id),
    CHECK (status IN ('pending', 'accepted', 'declined', 'completed'))
);

CREATE INDEX idx_challenges_challenger ON challenges(challenger_id);
CREATE INDEX idx_challenges_challenged ON challenges(challenged_id, status);

-- ========================================
-- 18. SHOP ITEMS TABLE
-- ========================================

CREATE TABLE shop_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    item_type VARCHAR(50),
    price_flash_points INTEGER NOT NULL,
    icon_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    is_premium_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (price_flash_points > 0)
);

CREATE INDEX idx_shop_items_available ON shop_items(is_available);
CREATE INDEX idx_shop_items_type ON shop_items(item_type);

-- ========================================
-- 19. USER PURCHASES TABLE
-- ========================================

CREATE TABLE user_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shop_item_id INTEGER REFERENCES shop_items(id) ON DELETE CASCADE,
    flash_points_spent INTEGER NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    CHECK (flash_points_spent > 0)
);

CREATE INDEX idx_user_purchases_user ON user_purchases(user_id);
CREATE INDEX idx_user_purchases_date ON user_purchases(purchased_at DESC);

-- ========================================
-- 20. NOTIFICATIONS TABLE
-- ========================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    message TEXT,
    related_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (notification_type IN ('friend_request', 'challenge', 'achievement', 'game_invite', 'message', 'system'))
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ========================================
-- DONE! Database schema created successfully
-- ========================================
