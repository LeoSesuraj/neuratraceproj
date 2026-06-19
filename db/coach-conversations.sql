-- Coach conversations: per-user persistence for the AI Coach.
-- Apply via Lovable Cloud migration tool.

CREATE TABLE public.coach_conversations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_conversations TO authenticated;
GRANT ALL ON public.coach_conversations TO service_role;

ALTER TABLE public.coach_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own coach conversations"
  ON public.coach_conversations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own coach conversations"
  ON public.coach_conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own coach conversations"
  ON public.coach_conversations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own coach conversations"
  ON public.coach_conversations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX coach_conversations_user_updated_idx
  ON public.coach_conversations (user_id, updated_at DESC);
