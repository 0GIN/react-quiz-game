-- =====================================================
-- PROFILE SYSTEM DATABASE SETUP
-- =====================================================
-- This script creates all tables and functions for the user profile and shop system
-- Execute this BEFORE seed-shop-items.sql

-- =====================================================
-- TABLE: user_profiles
-- =====================================================
-- Stores user profile information including customization and privacy settings

DO $$
BEGIN
  -- Jeżeli tabela istnieje i kolumna ma starą nazwę "id", zmień ją na "user_id"
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'id'
  ) THEN
    BEGIN
      ALTER TABLE public.user_profiles RENAME COLUMN id TO user_id;
    EXCEPTION WHEN duplicate_column THEN
      -- jeśli kolumna została już przemianowana ręcznie
      NULL;
    END;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT CHECK (char_length(bio) <= 500),
  avatar_url TEXT,
  banner_url TEXT,
  title TEXT,
  badges TEXT[] DEFAULT '{}',
  showcased_achievements INTEGER[] DEFAULT '{}' CHECK (array_length(showcased_achievements, 1) <= 5),
  profile_views INTEGER DEFAULT 0,
  show_stats BOOLEAN DEFAULT true,
  show_achievements BOOLEAN DEFAULT true,
  allow_friend_requests BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: shop_items
-- =====================================================
-- Stores all items available for purchase in the shop

CREATE TABLE IF NOT EXISTS public.shop_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('avatar', 'title', 'badge', 'background', 'frame', 'booster')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  price INTEGER NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: user_inventory
-- =====================================================
-- Tracks items owned by users

CREATE TABLE IF NOT EXISTS public.user_inventory (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, item_id)
);

-- =====================================================
-- TABLE: shop_transactions
-- =====================================================
-- Records all shop purchases for audit and history

CREATE TABLE IF NOT EXISTS public.shop_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES public.shop_items(id),
  price_paid INTEGER NOT NULL,
  transaction_date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRIGGER: Auto-create user profile
-- =====================================================
-- Automatically creates a profile when a new user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_username TEXT;
  safe_email TEXT;
  profile_display_name TEXT;
BEGIN
  -- Ustal bezpieczną nazwę użytkownika na podstawie meta danych lub identyfikatora
  default_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'player_' || replace(substring(NEW.id::text FROM 1 FOR 8), '-', '')
  );

  -- Zapewnij, że email zawsze zostanie zapisany (Supabase Auth może zwrócić NULL przy magic linkach)
  safe_email := COALESCE(NEW.email, 'pending-' || NEW.id::text || '@placeholder.local');

  profile_display_name := default_username;

  -- Utwórz rekord w głównej tabeli users z domyślnymi wartościami
  INSERT INTO public.users (
    id,
    email,
    username,
    avatar_url,
    flash_points,
    level,
    experience,
    experience_to_next_level,
    total_games_played,
    total_wins,
    total_losses,
    total_correct_answers,
    total_questions_answered,
    current_streak,
    best_streak,
    is_premium,
    is_admin,
    created_at,
    last_login
  ) VALUES (
    NEW.id,
    safe_email,
    default_username,
    'guest_avatar.png',
    0,
    1,
    0,
    100,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    NOW(),
    NULL
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        username = COALESCE(public.users.username, EXCLUDED.username);

  -- Załóż profil użytkownika (jeśli jeszcze nie istnieje)
  INSERT INTO public.user_profiles (
    user_id,
    display_name,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    profile_display_name,
    'guest_avatar.png',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Utwórz podstawowe statystyki użytkownika
  INSERT INTO public.user_stats (
    user_id,
    username,
    level,
    experience,
    flash_points,
    games_played,
    games_won,
    current_streak,
    best_streak,
    total_correct_answers,
    total_questions_answered,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    profile_display_name,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGER: Update timestamp
-- =====================================================
-- Updates the updated_at field whenever profile is modified

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- FUNCTION: Purchase item
-- =====================================================
-- Handles item purchase with transaction safety

CREATE OR REPLACE FUNCTION public.purchase_shop_item(
  p_user_id UUID,
  p_item_id INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_price INTEGER;
  v_current_fp INTEGER;
  v_category TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Get item details
  SELECT price, category INTO v_price, v_category
  FROM public.shop_items
  WHERE id = p_item_id AND is_available = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found or unavailable');
  END IF;

  -- Check if user already owns this item
  IF EXISTS (SELECT 1 FROM public.user_inventory WHERE user_id = p_user_id AND item_id = p_item_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item already owned');
  END IF;

  -- Get user's current FP
  SELECT flash_points INTO v_current_fp
  FROM public.user_stats
  WHERE user_id = p_user_id;

  IF NOT FOUND OR v_current_fp < v_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient Flash Points');
  END IF;

  -- Set expiration for boosters (24 hours)
  IF v_category = 'booster' THEN
    v_expires_at := NOW() + INTERVAL '24 hours';
  END IF;

  -- Deduct FP
  UPDATE public.user_stats
  SET flash_points = flash_points - v_price
  WHERE user_id = p_user_id;

  -- Add to inventory
  INSERT INTO public.user_inventory (user_id, item_id, expires_at)
  VALUES (p_user_id, p_item_id, v_expires_at);

  -- Record transaction
  INSERT INTO public.shop_transactions (user_id, item_id, price_paid)
  VALUES (p_user_id, p_item_id, v_price);

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_current_fp - v_price,
    'item_id', p_item_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES
-- =====================================================
-- Row Level Security for all tables

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_transactions ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
CREATE POLICY "Users can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- shop_items policies (read-only for users)
CREATE POLICY "Anyone can view available shop items"
  ON public.shop_items FOR SELECT
  USING (is_available = true);

-- user_inventory policies
CREATE POLICY "Users can view own inventory"
  ON public.user_inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
  ON public.user_inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert inventory items"
  ON public.user_inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- shop_transactions policies
CREATE POLICY "Users can view own transactions"
  ON public.shop_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON public.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item_id ON public.user_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_category ON public.shop_items(category);
CREATE INDEX IF NOT EXISTS idx_shop_transactions_user_id ON public.shop_transactions(user_id);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Profile system tables created successfully!';
  RAISE NOTICE 'Next step: Run seed-shop-items.sql to populate the shop';
END $$;
