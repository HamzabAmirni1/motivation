-- ====================================================================
--  ZENSTEP — COMPLETE PRODUCTION SUPABASE DATABASE SCHEMA
--  Preserves existing data, configures Row Level Security (RLS),
--  provides tables for Dashboard, Mood, Journal, Tools, Games, Habits,
--  Achievements, Notifications, and Keep-Alive Heartbeat.
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_count INTEGER DEFAULT 0,
  last_quest_date TEXT,
  role TEXT DEFAULT 'user', -- 'user' or 'admin'
  language TEXT DEFAULT 'ar',
  quests_data JSONB DEFAULT '{}'::jsonb,
  mood_data JSONB DEFAULT '[]'::jsonb,
  custom_ai_quests JSONB,
  chat_data JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{"notifications": true, "sounds": true, "theme": "dark"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert/update their own profile') THEN
    CREATE POLICY "Users can insert/update their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public select for keep-alive check') THEN
    CREATE POLICY "Public select for keep-alive check" ON public.profiles FOR SELECT USING (true);
  END IF;
END $$;

-- 3. MOOD ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL, -- 1 to 5 or 1 to 8
  mood_label TEXT NOT NULL,
  emoji TEXT,
  intensity INTEGER DEFAULT 5, -- 1 to 10
  causes TEXT[] DEFAULT '{}',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mood_entries' AND policyname = 'Users manage own mood entries') THEN
    CREATE POLICY "Users manage own mood entries" ON public.mood_entries FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. PRIVATE JOURNAL ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'journal_entries' AND policyname = 'Users manage own private journal') THEN
    CREATE POLICY "Users manage own private journal" ON public.journal_entries FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5. EXERCISE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.exercise_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL, -- 'grounding', 'breathing', 'cbt', 'focus', 'stress_relief', 'sleep'
  duration_seconds INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exercise_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exercise_sessions' AND policyname = 'Users manage own exercise sessions') THEN
    CREATE POLICY "Users manage own exercise sessions" ON public.exercise_sessions FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 6. HABITS TABLE
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily',
  icon TEXT DEFAULT '🌱',
  color TEXT DEFAULT '#6ee7b7',
  streak INTEGER DEFAULT 0,
  completions JSONB DEFAULT '[]'::jsonb, -- Array of 'YYYY-MM-DD'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habits' AND policyname = 'Users manage own habits') THEN
    CREATE POLICY "Users manage own habits" ON public.habits FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 7. USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'Users manage own achievements') THEN
    CREATE POLICY "Users manage own achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 8. GAME SCORES TABLE
CREATE TABLE IF NOT EXISTS public.game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL, -- 'pattern', 'memory', 'focus', 'number_puzzle', 'color_match', 'reaction'
  score INTEGER NOT NULL,
  difficulty TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'game_scores' AND policyname = 'Users manage own game scores') THEN
    CREATE POLICY "Users manage own game scores" ON public.game_scores FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'quest', 'streak', 'achievement', 'reminder', 'system'
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users manage own notifications') THEN
    CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 10. HEARTBEAT TABLE (Keeps Supabase Free Tier Alive Forever — "matb9ach tfa")
CREATE TABLE IF NOT EXISTS public.heartbeat (
  id TEXT PRIMARY KEY,
  pinged_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'automated_cron'
);

ALTER TABLE public.heartbeat ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'heartbeat' AND policyname = 'Public access to heartbeat') THEN
    CREATE POLICY "Public access to heartbeat" ON public.heartbeat FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Seed initial heartbeat
INSERT INTO public.heartbeat (id, pinged_at, source)
VALUES ('keep_alive_ping', NOW(), 'initial_migration')
ON CONFLICT (id) DO UPDATE SET pinged_at = NOW();

-- 11. AUTOMATIC PROFILE TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, xp, level, streak_count)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'صاحبي'),
    NEW.raw_user_meta_data->>'avatar_url',
    0,
    1,
    0
  )
  ON CONFLICT (id) DO NOTHING;

  -- Add welcome notification
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.id,
    'مرحباً بك في ZenStep 🌱',
    'بدا رحلتك نحو راحة البال والعافية النفسية. خذ أول تمرين واكسب نقاط XP!',
    'system'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ====================================================================
-- SCHEMA READY & FULLY COMPATIBLE WITH ZENSTEP
-- ====================================================================
