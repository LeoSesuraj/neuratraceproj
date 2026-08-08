-- =========================================================================
-- Fix demo thread authorship for Margaret B.
--
-- The account reset re-pointed every message to one user, so the family's
-- replies render on the care team's side of the chat. This restores the
-- correct author and the snapshot label/role each message displays with.
--
-- Safe to run repeatedly. Paste into the Cloud SQL editor.
-- =========================================================================

DO $$
DECLARE
  fam_id UUID;
  staff_id UUID;
BEGIN
  SELECT id INTO fam_id FROM auth.users WHERE email = 'family@neuratrace.demo';
  SELECT id INTO staff_id FROM auth.users WHERE email = 'staff@neuratrace.demo';

  -- Care team side: messages that already carry the caregiver label.
  UPDATE public.resident_messages
     SET sender_id = COALESCE(staff_id, sender_id),
         sender_label = 'Sunrise Caregiver',
         sender_role = 'staff'
   WHERE sender_label = 'Sunrise Caregiver';

  -- Family side: everything else in the seeded thread.
  UPDATE public.resident_messages
     SET sender_id = COALESCE(fam_id, sender_id),
         sender_label = 'Margaret''s Family',
         sender_role = 'family'
   WHERE sender_label IS NULL OR sender_label = '';
END;
$$;

-- Verify: should alternate staff / family.
SELECT created_at, sender_role, sender_label, left(content, 50) AS preview
FROM public.resident_messages
ORDER BY created_at;
