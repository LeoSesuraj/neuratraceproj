-- Run this in Supabase SQL editor (Lovable Cloud > SQL).
-- Adds family<->staff messaging thread per resident.

CREATE TABLE IF NOT EXISTS public.resident_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(btrim(content)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS resident_messages_resident_created_idx
  ON public.resident_messages (resident_id, created_at ASC);

GRANT SELECT, INSERT ON public.resident_messages TO authenticated;
GRANT ALL ON public.resident_messages TO service_role;

ALTER TABLE public.resident_messages ENABLE ROW LEVEL SECURITY;

-- Security-definer access check used by RLS to avoid recursive policy lookups.
CREATE OR REPLACE FUNCTION public.can_access_resident_thread(_user_id UUID, _resident_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.resident_family rf
      WHERE rf.resident_id = _resident_id
        AND rf.user_id = _user_id
    )
    OR EXISTS (
      SELECT 1
      FROM public.residents r
      JOIN public.user_roles ur ON ur.facility_id = r.facility_id
      WHERE r.id = _resident_id
        AND ur.user_id = _user_id
        AND ur.role IN ('staff', 'admin')
        AND ur.deactivated_at IS NULL
    )
$$;

DROP POLICY IF EXISTS "Members read resident messages" ON public.resident_messages;
CREATE POLICY "Members read resident messages"
  ON public.resident_messages
  FOR SELECT
  TO authenticated
  USING (public.can_access_resident_thread(auth.uid(), resident_id));

DROP POLICY IF EXISTS "Members send resident messages" ON public.resident_messages;
CREATE POLICY "Members send resident messages"
  ON public.resident_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.can_access_resident_thread(auth.uid(), resident_id)
  );

-- No UPDATE / DELETE policies — messages are immutable by design.

-- Enable Supabase Realtime for this table.
ALTER TABLE public.resident_messages REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'resident_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.resident_messages;
  END IF;
END $$;
