-- Run this in Lovable Cloud > SQL editor.
-- Fix: deleting a user account cascade-deleted all of their messages, which is
-- why Margaret's thread showed staff messages only after the demo family
-- account was recreated. Messages now survive account deletion and keep a
-- snapshot of who wrote them.

ALTER TABLE public.resident_messages
  ADD COLUMN IF NOT EXISTS sender_label TEXT,
  ADD COLUMN IF NOT EXISTS sender_role TEXT;

ALTER TABLE public.resident_messages
  ALTER COLUMN sender_id DROP NOT NULL;

ALTER TABLE public.resident_messages
  DROP CONSTRAINT IF EXISTS resident_messages_sender_id_fkey;

ALTER TABLE public.resident_messages
  ADD CONSTRAINT resident_messages_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill snapshots for existing rows.
UPDATE public.resident_messages m
SET sender_label = COALESCE(m.sender_label, p.name, p.email)
FROM public.profiles p
WHERE p.id = m.sender_id AND m.sender_label IS NULL;
