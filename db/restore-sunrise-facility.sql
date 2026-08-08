-- =========================================================================
-- Restore "Sunrise Memory Care Center" + Margaret B. after an accidental
-- facility delete.
--
-- Run this whole file in Lovable Cloud > Database > SQL editor.
-- Safe to run more than once.
--
-- Deleting a facility cascades to its residents, and deleting a resident
-- cascades to that resident's posts, mood logs and message thread. Those
-- rows cannot be recovered; this script rebuilds the facility, the resident,
-- the role assignments and the family/staff links so the demo works again.
-- Afterwards run db/fix-demo-message-senders.sql to reseed the chat history.
-- =========================================================================

DO $$
DECLARE
  v_super    UUID := 'aaaaaaa1-0000-4000-8000-000000000001';
  v_admin    UUID := 'aaaaaaa1-0000-4000-8000-000000000002';
  v_staff    UUID := 'aaaaaaa1-0000-4000-8000-000000000003';
  v_family   UUID := 'aaaaaaa1-0000-4000-8000-000000000004';
  v_sunrise  UUID := '11111111-1111-1111-1111-111111111111';
  v_margaret UUID;
BEGIN
  -- ------------------------------------------------------------- 1. facility
  SELECT id INTO v_sunrise FROM public.facilities
   WHERE name ILIKE 'Sunrise%' ORDER BY created_at LIMIT 1;

  IF v_sunrise IS NULL THEN
    v_sunrise := '11111111-1111-1111-1111-111111111111';
    INSERT INTO public.facilities (id, name)
    VALUES (v_sunrise, 'Sunrise Memory Care Center')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  END IF;

  -- ------------------------------------------------------------- 2. resident
  SELECT id INTO v_margaret FROM public.residents
   WHERE name ILIKE 'Margaret%' ORDER BY created_at LIMIT 1;

  IF v_margaret IS NULL THEN
    v_margaret := '22222222-2222-2222-2222-222222222222';
    INSERT INTO public.residents (id, name, facility_id, dementia_type, date_of_birth, photo_url)
    VALUES (
      v_margaret, 'Margaret B.', v_sunrise, "Alzheimer's disease", NULL,
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80'
    )
    ON CONFLICT (id) DO UPDATE
      SET facility_id = EXCLUDED.facility_id, name = EXCLUDED.name;
  ELSE
    UPDATE public.residents SET facility_id = v_sunrise WHERE id = v_margaret;
  END IF;

  -- Optional behaviors column (added by db/resident-behaviors.sql).
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'residents' AND column_name = 'behaviors'
  ) THEN
    EXECUTE format(
      'UPDATE public.residents SET behaviors = %L WHERE id = %L AND (behaviors IS NULL OR cardinality(behaviors) = 0)',
      '{repetition,sundowning,agitation}', v_margaret
    );
  END IF;

  -- ------------------------------------------------- 3. profiles + roles
  UPDATE public.profiles SET facility_id = v_sunrise WHERE id IN (v_admin, v_staff);

  DELETE FROM public.user_roles WHERE user_id IN (v_admin, v_staff);
  INSERT INTO public.user_roles (user_id, role, facility_id) VALUES
    (v_admin, 'admin'::public.app_role, v_sunrise),
    (v_staff, 'staff'::public.app_role, v_sunrise);

  -- Super admin keeps a single facility-less role.
  DELETE FROM public.user_roles WHERE user_id = v_super;
  INSERT INTO public.user_roles (user_id, role, facility_id)
  VALUES (v_super, 'super_admin'::public.app_role, NULL);

  -- ------------------------------------------------------ 4. staff / family
  DELETE FROM public.resident_staff WHERE user_id = v_staff;
  INSERT INTO public.resident_staff (resident_id, user_id, facility_id)
    SELECT r.id, v_staff, v_sunrise
      FROM public.residents r WHERE r.facility_id = v_sunrise;

  DELETE FROM public.resident_family WHERE user_id = v_family;
  INSERT INTO public.resident_family (resident_id, user_id)
  VALUES (v_margaret, v_family);
END $$;

-- Verify
SELECT f.name AS facility, r.name AS resident FROM public.facilities f
LEFT JOIN public.residents r ON r.facility_id = f.id
WHERE f.name ILIKE 'Sunrise%';

SELECT u.email, ur.role, f.name AS facility
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.facilities f ON f.id = ur.facility_id
WHERE u.email LIKE '%@neuratrace.demo'
ORDER BY u.email;
