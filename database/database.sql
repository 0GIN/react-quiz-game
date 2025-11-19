-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.achievements (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  icon_emoji character varying,
  requirement_type character varying,
  requirement_value integer,
  flash_points_reward integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT achievements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categories (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL UNIQUE,
  icon_emoji character varying,
  description text,
  question_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  challenger_id uuid,
  challenged_id uuid,
  game_mode_id integer,
  category_id integer,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'accepted'::character varying, 'declined'::character varying, 'completed'::character varying]::text[])),
  message text,
  created_at timestamp with time zone DEFAULT now(),
  responded_at timestamp with time zone,
  game_id uuid,
  CONSTRAINT challenges_pkey PRIMARY KEY (id),
  CONSTRAINT challenges_challenger_id_fkey FOREIGN KEY (challenger_id) REFERENCES public.users(id),
  CONSTRAINT challenges_challenged_id_fkey FOREIGN KEY (challenged_id) REFERENCES public.users(id),
  CONSTRAINT challenges_game_mode_id_fkey FOREIGN KEY (game_mode_id) REFERENCES public.game_modes(id),
  CONSTRAINT challenges_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT challenges_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id)
);
CREATE TABLE public.chat_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_type character varying DEFAULT 'direct'::character varying CHECK (conversation_type::text = ANY (ARRAY['direct'::character varying, 'group'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  last_message_at timestamp with time zone,
  CONSTRAINT chat_conversations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  message_text text NOT NULL CHECK (length(message_text) <= 2000),
  is_read boolean DEFAULT false,
  sent_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id),
  CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);
CREATE TABLE public.chat_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone DEFAULT now(),
  last_read_at timestamp with time zone,
  CONSTRAINT chat_participants_pkey PRIMARY KEY (id),
  CONSTRAINT chat_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id),
  CONSTRAINT chat_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.daily_missions (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  description text,
  mission_type character varying,
  target_value integer NOT NULL CHECK (target_value > 0),
  flash_points_reward integer DEFAULT 0,
  experience_reward integer DEFAULT 0,
  valid_date date NOT NULL,
  is_active boolean DEFAULT true,
  CONSTRAINT daily_missions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.duel_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL,
  player_id uuid NOT NULL,
  question_id uuid NOT NULL,
  selected_answer character varying NOT NULL CHECK (selected_answer::text = ANY (ARRAY['A'::character varying, 'B'::character varying, 'C'::character varying, 'D'::character varying]::text[])),
  is_correct boolean NOT NULL,
  time_taken integer,
  answered_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT duel_answers_pkey PRIMARY KEY (id),
  CONSTRAINT duel_answers_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.duel_rounds(id),
  CONSTRAINT duel_answers_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.users(id),
  CONSTRAINT duel_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
);
CREATE TABLE public.duel_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  player1_id uuid NOT NULL,
  player2_id uuid NOT NULL,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'active'::character varying, 'completed'::character varying, 'declined'::character varying, 'cancelled'::character varying]::text[])),
  current_round integer DEFAULT 0 CHECK (current_round >= 0 AND current_round <= 6),
  current_turn_player_id uuid,
  player1_score integer DEFAULT 0,
  player2_score integer DEFAULT 0,
  winner_id uuid,
  challenge_message text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  accepted_at timestamp with time zone,
  completed_at timestamp with time zone,
  last_activity_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT duel_matches_pkey PRIMARY KEY (id),
  CONSTRAINT duel_matches_player1_id_fkey FOREIGN KEY (player1_id) REFERENCES public.users(id),
  CONSTRAINT duel_matches_player2_id_fkey FOREIGN KEY (player2_id) REFERENCES public.users(id),
  CONSTRAINT duel_matches_current_turn_player_id_fkey FOREIGN KEY (current_turn_player_id) REFERENCES public.users(id),
  CONSTRAINT duel_matches_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES public.users(id)
);
CREATE TABLE public.duel_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  level integer NOT NULL,
  flash_points integer NOT NULL,
  preferred_categories ARRAY,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '00:30:00'::interval),
  CONSTRAINT duel_queue_pkey PRIMARY KEY (id),
  CONSTRAINT duel_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.duel_rounds (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  round_number integer NOT NULL CHECK (round_number >= 1 AND round_number <= 5),
  category_chooser_id uuid NOT NULL,
  category_id integer NOT NULL,
  question1_id uuid,
  question2_id uuid,
  question3_id uuid,
  player1_answered boolean DEFAULT false,
  player2_answered boolean DEFAULT false,
  player1_correct integer DEFAULT 0 CHECK (player1_correct >= 0 AND player1_correct <= 3),
  player2_correct integer DEFAULT 0 CHECK (player2_correct >= 0 AND player2_correct <= 3),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  player1_answered_at timestamp with time zone,
  player2_answered_at timestamp with time zone,
  answers_q1 jsonb,
  answers_q2 jsonb,
  answers_q3 jsonb,
  CONSTRAINT duel_rounds_pkey PRIMARY KEY (id),
  CONSTRAINT duel_rounds_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.duel_matches(id),
  CONSTRAINT duel_rounds_category_chooser_id_fkey FOREIGN KEY (category_chooser_id) REFERENCES public.users(id),
  CONSTRAINT duel_rounds_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT duel_rounds_question1_id_fkey FOREIGN KEY (question1_id) REFERENCES public.questions(id),
  CONSTRAINT duel_rounds_question2_id_fkey FOREIGN KEY (question2_id) REFERENCES public.questions(id),
  CONSTRAINT duel_rounds_question3_id_fkey FOREIGN KEY (question3_id) REFERENCES public.questions(id)
);
CREATE TABLE public.friendships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  friend_id uuid NOT NULL,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'accepted'::character varying, 'blocked'::character varying]::text[])),
  requested_at timestamp with time zone DEFAULT now(),
  accepted_at timestamp with time zone,
  CONSTRAINT friendships_pkey PRIMARY KEY (id),
  CONSTRAINT friendships_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT friendships_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES public.users(id)
);
CREATE TABLE public.game_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL,
  user_id uuid NOT NULL,
  question_id uuid NOT NULL,
  answer_given text NOT NULL,
  is_correct boolean NOT NULL,
  time_taken_seconds integer,
  answered_at timestamp with time zone DEFAULT now(),
  CONSTRAINT game_answers_pkey PRIMARY KEY (id),
  CONSTRAINT game_answers_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id),
  CONSTRAINT game_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT game_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
);
CREATE TABLE public.game_modes (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  min_players integer NOT NULL CHECK (min_players > 0),
  max_players integer NOT NULL,
  time_limit_seconds integer,
  lives_count integer,
  requires_category boolean DEFAULT false,
  is_active boolean DEFAULT true,
  CONSTRAINT game_modes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.game_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL,
  user_id uuid NOT NULL,
  team_number integer DEFAULT 1 CHECK (team_number = ANY (ARRAY[1, 2])),
  score integer DEFAULT 0 CHECK (score >= 0),
  correct_answers integer DEFAULT 0,
  wrong_answers integer DEFAULT 0,
  lives_remaining integer,
  placement integer,
  flash_points_earned integer DEFAULT 0,
  experience_earned integer DEFAULT 0,
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT game_participants_pkey PRIMARY KEY (id),
  CONSTRAINT game_participants_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id),
  CONSTRAINT game_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.game_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL,
  question_id uuid NOT NULL,
  question_order integer NOT NULL,
  CONSTRAINT game_questions_pkey PRIMARY KEY (id),
  CONSTRAINT game_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id),
  CONSTRAINT game_questions_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id)
);
CREATE TABLE public.games (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  game_mode_id integer,
  category_id integer,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'active'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[])),
  winner_user_id uuid,
  total_questions integer DEFAULT 10,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  CONSTRAINT games_pkey PRIMARY KEY (id),
  CONSTRAINT games_game_mode_id_fkey FOREIGN KEY (game_mode_id) REFERENCES public.game_modes(id),
  CONSTRAINT games_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT games_winner_user_id_fkey FOREIGN KEY (winner_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  content text NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 1000),
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notification_type character varying CHECK (notification_type::text = ANY (ARRAY['friend_request'::character varying, 'challenge'::character varying, 'achievement'::character varying, 'game_invite'::character varying, 'message'::character varying, 'system'::character varying]::text[])),
  title character varying NOT NULL,
  message text,
  related_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id integer,
  question_text text NOT NULL,
  correct_answer text NOT NULL,
  wrong_answer_1 text NOT NULL,
  wrong_answer_2 text NOT NULL,
  wrong_answer_3 text NOT NULL,
  difficulty_level character varying DEFAULT 'medium'::character varying CHECK (difficulty_level::text = ANY (ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying]::text[])),
  points_value integer DEFAULT 10 CHECK (points_value > 0),
  submitted_by_user_id uuid,
  is_approved boolean DEFAULT false,
  is_active boolean DEFAULT true,
  times_answered integer DEFAULT 0,
  times_correct integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT questions_submitted_by_user_id_fkey FOREIGN KEY (submitted_by_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.shop_items (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category = ANY (ARRAY['avatar'::text, 'title'::text, 'badge'::text, 'background'::text, 'frame'::text, 'booster'::text])),
  rarity text NOT NULL CHECK (rarity = ANY (ARRAY['common'::text, 'rare'::text, 'epic'::text, 'legendary'::text])),
  price integer NOT NULL CHECK (price >= 0),
  image_url text,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shop_items_pkey PRIMARY KEY (id)
);
CREATE TABLE public.shop_transactions (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  item_id integer NOT NULL,
  price_paid integer NOT NULL,
  transaction_date timestamp with time zone DEFAULT now(),
  CONSTRAINT shop_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT shop_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT shop_transactions_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.shop_items(id)
);
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id integer NOT NULL,
  unlocked_at timestamp with time zone DEFAULT now(),
  is_new boolean DEFAULT true,
  CONSTRAINT user_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id)
);
CREATE TABLE public.user_daily_missions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mission_id integer NOT NULL,
  current_progress integer DEFAULT 0 CHECK (current_progress >= 0),
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  is_claimed boolean DEFAULT false,
  claimed_at timestamp with time zone,
  CONSTRAINT user_daily_missions_pkey PRIMARY KEY (id),
  CONSTRAINT user_daily_missions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_daily_missions_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.daily_missions(id)
);
CREATE TABLE public.user_inventory (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  item_id integer NOT NULL,
  purchased_at timestamp with time zone DEFAULT now(),
  is_equipped boolean DEFAULT false,
  expires_at timestamp with time zone,
  CONSTRAINT user_inventory_pkey PRIMARY KEY (id),
  CONSTRAINT user_inventory_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_inventory_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.shop_items(id)
);
CREATE TABLE public.user_profiles (
  user_id uuid NOT NULL,
  display_name text,
  bio text CHECK (char_length(bio) <= 500),
  avatar_url text,
  banner_url text,
  title text,
  badges ARRAY DEFAULT '{}'::text[],
  showcased_achievements ARRAY DEFAULT '{}'::integer[] CHECK (array_length(showcased_achievements, 1) <= 5),
  profile_views integer DEFAULT 0,
  show_stats boolean DEFAULT true,
  show_achievements boolean DEFAULT true,
  allow_friend_requests boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  shop_item_id integer NOT NULL,
  flash_points_spent integer NOT NULL CHECK (flash_points_spent > 0),
  purchased_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT user_purchases_pkey PRIMARY KEY (id),
  CONSTRAINT user_purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_purchases_shop_item_id_fkey FOREIGN KEY (shop_item_id) REFERENCES public.shop_items(id)
);
CREATE TABLE public.user_stats (
  user_id uuid NOT NULL,
  username text UNIQUE,
  level integer DEFAULT 1,
  experience integer DEFAULT 0,
  flash_points integer DEFAULT 0,
  games_played integer DEFAULT 0,
  games_won integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  total_correct_answers integer DEFAULT 0,
  total_questions_answered integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_stats_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text UNIQUE,
  username text UNIQUE,
  avatar_url text DEFAULT 'guest_avatar.png'::text,
  flash_points integer NOT NULL DEFAULT 0 CHECK (flash_points >= 0),
  level integer NOT NULL DEFAULT 1 CHECK (level >= 1),
  experience integer NOT NULL DEFAULT 0 CHECK (experience >= 0),
  experience_to_next_level integer NOT NULL DEFAULT 100,
  total_games_played integer NOT NULL DEFAULT 0,
  total_wins integer NOT NULL DEFAULT 0,
  total_losses integer NOT NULL DEFAULT 0,
  total_correct_answers integer NOT NULL DEFAULT 0,
  total_questions_answered integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  rank_position integer,
  is_premium boolean NOT NULL DEFAULT false,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_login timestamp with time zone,
  total_draws integer DEFAULT 0,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);