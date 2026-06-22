-- Run this in Supabase SQL editor (Lovable Cloud > SQL).
-- Adds per-user notifications, with a trigger that fans out new
-- resident_messages only between staff and family recipients.

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_read_created_idx
  ON public.notifications (user_id, read, created_at DESC);

-- Users can read and update (mark read) their own notifications only.
-- Inserts are performed by the trigger function below (SECURITY DEFINER).
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
CREATE POLICY "Users read own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- No INSERT or DELETE policies — only the trigger (security definer) writes here.

-- Trigger: on every resident_messages insert, fan out notifications.
CREATE OR REPLACE FUNCTION public.notify_on_resident_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_facility UUID;
  v_sender_is_admin BOOLEAN;
  v_sender_is_family BOOLEAN;
  v_sender_is_staff BOOLEAN;
  v_preview TEXT;
BEGIN
  SELECT facility_id INTO v_facility
  FROM public.residents
  WHERE id = NEW.resident_id;

  SELECT EXISTS(
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = NEW.sender_id
      AND ur.facility_id = v_facility
      AND ur.role = 'admin'
      AND ur.deactivated_at IS NULL
  ) INTO v_sender_is_admin;

  SELECT EXISTS(
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = NEW.sender_id
      AND ur.facility_id = v_facility
      AND ur.role = 'family'
      AND ur.deactivated_at IS NULL
      AND EXISTS (
        SELECT 1 FROM public.resident_family rf
        WHERE rf.resident_id = NEW.resident_id
          AND rf.user_id = ur.user_id
      )
  ) INTO v_sender_is_family;

  SELECT EXISTS(
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = NEW.sender_id
      AND ur.facility_id = v_facility
      AND ur.role = 'staff'
      AND ur.deactivated_at IS NULL
  ) INTO v_sender_is_staff;

  v_preview := substring(NEW.content FROM 1 FOR 200);

  IF v_sender_is_family AND NOT v_sender_is_admin THEN
    -- Family sent → notify staff at that facility (skip the sender, exclude admins).
    INSERT INTO public.notifications (user_id, resident_id, type, message)
    SELECT DISTINCT ur.user_id, NEW.resident_id, 'new_message', v_preview
    FROM public.user_roles ur
    WHERE ur.facility_id = v_facility
      AND ur.role = 'staff'
      AND ur.deactivated_at IS NULL
      AND ur.user_id <> NEW.sender_id
      AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur2
        WHERE ur2.user_id = ur.user_id
          AND ur2.role = 'admin'
          AND ur2.deactivated_at IS NULL
      );
  ELSIF v_sender_is_staff AND NOT v_sender_is_admin THEN
    -- Staff sent → notify family linked to that resident (never admins).
    -- Drive from active family roles first, then confirm the user is linked
    -- to this resident. This prevents admin/staff accounts that appear in
    -- resident_family from being notified as family recipients.
    INSERT INTO public.notifications (user_id, resident_id, type, message)
    SELECT DISTINCT ur.user_id, NEW.resident_id, 'new_message', v_preview
    FROM public.user_roles ur
    WHERE ur.role = 'family'
      AND ur.facility_id = v_facility
      AND ur.deactivated_at IS NULL
      AND ur.user_id <> NEW.sender_id
      AND NOT EXISTS (
        SELECT 1 FROM public.user_roles admin_role
        WHERE admin_role.user_id = ur.user_id
          AND admin_role.facility_id = v_facility
          AND admin_role.role = 'admin'
          AND admin_role.deactivated_at IS NULL
      )
      AND EXISTS (
        SELECT 1 FROM public.resident_family rf
        WHERE rf.resident_id = NEW.resident_id
          AND rf.user_id = ur.user_id
      );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS resident_messages_notify ON public.resident_messages;
CREATE TRIGGER resident_messages_notify
  AFTER INSERT ON public.resident_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_resident_message();

-- Remove previously-created message notifications for admins so their UI is clean.
DELETE FROM public.notifications n
USING public.user_roles ur
WHERE n.user_id = ur.user_id
  AND n.type = 'new_message'
  AND ur.role = 'admin'
  AND ur.deactivated_at IS NULL;

-- Enable Supabase Realtime so the bell badge updates live.
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
