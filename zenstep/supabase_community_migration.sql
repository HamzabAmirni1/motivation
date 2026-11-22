-- ==============================================================================
-- ZENSTEP COMMUNITY SYSTEM — PRODUCTION SUPABASE MIGRATION
-- Single Global Chat + Admin Pinned Message + Private Admin Only Messaging
-- ==============================================================================

-- 1. Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Define secure Admin helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND LOWER(auth.users.email) IN (
        'amirnihamza61@gmail.com',
        'hamza.amirni@gmail.com',
        'hamzaamirni451@gmail.com'
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid()
      AND public.profiles.role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Global Chat Messages Table (ONE shared group for all users)
CREATE TABLE IF NOT EXISTS public.global_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  moderation_status TEXT DEFAULT 'visible' CHECK (moderation_status IN ('visible', 'hidden', 'flagged')),
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_global_chat_created_at ON public.global_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_chat_moderation ON public.global_chat_messages(moderation_status);
CREATE INDEX IF NOT EXISTS idx_global_chat_user ON public.global_chat_messages(user_id);

-- 4. Admin Pinned Messages Table (Only one active pinned message allowed)
CREATE TABLE IF NOT EXISTS public.admin_pinned_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.global_chat_messages(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT,
  author_avatar TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_pinned_msg 
  ON public.admin_pinned_messages (active) 
  WHERE (active = true);

-- 5. Admin Private Messages Table (Users <-> Admin ONLY)
CREATE TABLE IF NOT EXISTS public.admin_private_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_private_msgs_users ON public.admin_private_messages(sender_id, recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_private_msgs_recipient_unread ON public.admin_private_messages(recipient_id) WHERE (read_at IS NULL);

-- 6. Global Chat Message Reactions
CREATE TABLE IF NOT EXISTS public.global_chat_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.global_chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_message_user_reaction UNIQUE(message_id, user_id, reaction)
);

CREATE INDEX IF NOT EXISTS idx_chat_reactions_msg ON public.global_chat_reactions(message_id);

-- 7. Community Reports (Flagging inappropriate content)
CREATE TABLE IF NOT EXISTS public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.global_chat_messages(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_reports_status ON public.community_reports(status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.global_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_pinned_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_chat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

-- Global Chat Messages Policies
DROP POLICY IF EXISTS "global_chat_select" ON public.global_chat_messages;
CREATE POLICY "global_chat_select" ON public.global_chat_messages
  FOR SELECT TO authenticated
  USING (moderation_status = 'visible' OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "global_chat_insert" ON public.global_chat_messages;
CREATE POLICY "global_chat_insert" ON public.global_chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "global_chat_update" ON public.global_chat_messages;
CREATE POLICY "global_chat_update" ON public.global_chat_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "global_chat_delete" ON public.global_chat_messages;
CREATE POLICY "global_chat_delete" ON public.global_chat_messages
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- Admin Pinned Messages Policies
DROP POLICY IF EXISTS "pinned_select" ON public.admin_pinned_messages;
CREATE POLICY "pinned_select" ON public.admin_pinned_messages
  FOR SELECT TO authenticated
  USING (active = true OR public.is_admin());

DROP POLICY IF EXISTS "pinned_admin_all" ON public.admin_pinned_messages;
CREATE POLICY "pinned_admin_all" ON public.admin_pinned_messages
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin Private Messages Policies
-- Normal users can only see their own messages with admin. Admin sees all conversations.
DROP POLICY IF EXISTS "private_messages_select" ON public.admin_private_messages;
CREATE POLICY "private_messages_select" ON public.admin_private_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id OR public.is_admin());

DROP POLICY IF EXISTS "private_messages_insert" ON public.admin_private_messages;
CREATE POLICY "private_messages_insert" ON public.admin_private_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "private_messages_update" ON public.admin_private_messages;
CREATE POLICY "private_messages_update" ON public.admin_private_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id OR public.is_admin());

-- Reactions Policies
DROP POLICY IF EXISTS "reactions_select" ON public.global_chat_reactions;
CREATE POLICY "reactions_select" ON public.global_chat_reactions
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "reactions_insert" ON public.global_chat_reactions;
CREATE POLICY "reactions_insert" ON public.global_chat_reactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reactions_delete" ON public.global_chat_reactions;
CREATE POLICY "reactions_delete" ON public.global_chat_reactions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Community Reports Policies
DROP POLICY IF EXISTS "reports_admin_select" ON public.community_reports;
CREATE POLICY "reports_admin_select" ON public.community_reports
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "reports_user_insert" ON public.community_reports;
CREATE POLICY "reports_user_insert" ON public.community_reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_admin_update" ON public.community_reports;
CREATE POLICY "reports_admin_update" ON public.community_reports
  FOR UPDATE TO authenticated
  USING (public.is_admin());

-- Realtime publication updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'global_chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.global_chat_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'admin_pinned_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_pinned_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'admin_private_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_private_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'global_chat_reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.global_chat_reactions;
  END IF;
END $$;
