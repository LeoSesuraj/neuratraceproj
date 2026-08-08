-- =========================================================================
-- NeuraTrace demo account reset
--
-- Run this whole file in the Lovable Cloud SQL editor (Cloud > Database > SQL).
-- It works WITHOUT the backend service key, which is why we use it right now.
--
-- What it does, in order:
--   1. Creates the 4 demo accounts (fixed UUIDs, confirmed, password below).
--   2. Re-points every existing row that pointed at an old/deleted account
--      to the new accounts, so Margaret B's posts, mood logs and message
--      thread survive.
--   3. Deletes every other auth account.
--   4. Writes profiles, roles, staff assignments and the family link.
--
-- Password for all four accounts: Demo2026!Pass
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_super  UUID := 'aaaaaaa1-0000-4000-8000-000000000001';
  v_admin  UUID := 'aaaaaaa1-0000-4000-8000-000000000002';
  v_staff  UUID := 'aaaaaaa1-0000-4000-8000-000000000003';
  v_family UUID := 'aaaaaaa1-0000-4000-8000-000000000004';
  v_pw     TEXT := 'Demo2026!Pass';
  v_sunrise UUID;
  v_margaret UUID;
  r RECORD;
BEGIN
  -- Free the four demo email addresses without deleting their old accounts.
  -- Deleting here would immediately fire ON DELETE actions (for example,
  -- posts.author_id -> NULL) before the rows can be re-pointed below.
  UPDATE auth.users
     SET email = 'demo-reset-' || id::text || '@invalid.local',
         updated_at = now()
   WHERE lower(email) IN (
     'superadmin@neuratrace.demo',
     'admin@neuratrace.demo',
     'staff@neuratrace.demo',
     'family@neuratrace.demo'
   )
     AND id NOT IN (v_super, v_admin, v_staff, v_family);

  -- ---------------------------------------------------------------- 1. users
  FOR r IN
    SELECT * FROM (VALUES
      (v_super,  'superadmin@neuratrace.demo', 'Super Admin'),
      (v_admin,  'admin@neuratrace.demo',      'Facility Admin'),
      (v_staff,  'staff@neuratrace.demo',      'Sunrise Caregiver'),
      (v_family, 'family@neuratrace.demo',     'Margaret''s Daughter')
    ) AS t(id, email, name)
  LOOP
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', r.id, 'authenticated', 'authenticated',
      r.email, crypt(v_pw, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', r.name),
      now(), now()
    )
    ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          encrypted_password = EXCLUDED.encrypted_password,
          email_confirmed_at = now(),
          raw_app_meta_data = EXCLUDED.raw_app_meta_data,
          raw_user_meta_data = EXCLUDED.raw_user_meta_data,
          updated_at = now();

    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), r.id, r.id::text,
      jsonb_build_object('sub', r.id::text, 'email', r.email, 'email_verified', true),
      'email', now(), now(), now()
    )
    ON CONFLICT (provider_id, provider) DO UPDATE
      SET user_id = EXCLUDED.user_id, identity_data = EXCLUDED.identity_data;
  END LOOP;

  -- ------------------------------------------ 2. facility / resident + profiles
  -- Profiles must exist BEFORE re-pointing, because many tables reference
  -- public.profiles(id) rather than auth.users(id).
  SELECT id INTO v_sunrise FROM public.facilities
   WHERE name ILIKE 'Sunrise%' ORDER BY created_at LIMIT 1;
  IF v_sunrise IS NULL THEN
    INSERT INTO public.facilities (id, name)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Sunrise Memory Care Center')
    RETURNING id INTO v_sunrise;
  END IF;

  SELECT id INTO v_margaret FROM public.residents
   WHERE name ILIKE 'Margaret%' ORDER BY created_at LIMIT 1;

  INSERT INTO public.profiles (id, email, name, facility_id) VALUES
    (v_super,  'superadmin@neuratrace.demo', 'Super Admin',         NULL),
    (v_admin,  'admin@neuratrace.demo',      'Facility Admin',      v_sunrise),
    (v_staff,  'staff@neuratrace.demo',      'Sunrise Caregiver',   v_sunrise),
    (v_family, 'family@neuratrace.demo',     'Margaret''s Daughter', NULL)
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email, name = EXCLUDED.name, facility_id = EXCLUDED.facility_id;

  -- ------------------------------------------- 3. re-point orphaned authorship
  -- Family-authored messages go to the new family account when the snapshot
  -- column exists; everything else that referenced a dead account goes to the
  -- new caregiver account so nothing is nulled/deleted in step 4.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'resident_messages' AND column_name = 'sender_role'
  ) THEN
    EXECUTE format(
      'UPDATE public.resident_messages SET sender_id = %L WHERE sender_role = %L',
      v_family, 'family'
    );
  END IF;

  FOR r IN
    SELECT DISTINCT c.table_name, c.column_name
    FROM information_schema.columns c
    JOIN information_schema.key_column_usage k
      ON k.table_schema = c.table_schema AND k.table_name = c.table_name AND k.column_name = c.column_name
    JOIN information_schema.referential_constraints rc
      ON rc.constraint_name = k.constraint_name AND rc.constraint_schema = k.table_schema
    JOIN information_schema.constraint_column_usage u
      ON u.constraint_name = rc.unique_constraint_name AND u.constraint_schema = rc.unique_constraint_schema
    WHERE c.table_schema = 'public'
      AND (
        (u.table_schema = 'auth'   AND u.table_name = 'users')
        OR (u.table_schema = 'public' AND u.table_name = 'profiles')
      )
      AND NOT (c.table_name = 'profiles' AND c.column_name = 'id')
  LOOP
    EXECUTE format(
      'UPDATE public.%I SET %I = %L WHERE %I IS NOT NULL AND %I NOT IN (%L,%L,%L,%L)',
      r.table_name, r.column_name, v_staff, r.column_name, r.column_name,
      v_super, v_admin, v_staff, v_family
    );
  END LOOP;

  -- Drop leftover profile rows for accounts that are about to disappear.
  DELETE FROM public.profiles
   WHERE id NOT IN (v_super, v_admin, v_staff, v_family);

  -- ------------------------------------------------------- 4. drop old accounts
  DELETE FROM auth.users WHERE id NOT IN (v_super, v_admin, v_staff, v_family);

  -- ------------------------------------------------------ 5. roles/links
  DELETE FROM public.user_roles
   WHERE user_id IN (v_super, v_admin, v_staff, v_family);

  -- Super admin also gets a real admin row at every facility so all reads work
  -- through normal row-level security, not just the privileged key.
  INSERT INTO public.user_roles (user_id, role, facility_id)
    SELECT v_super, 'admin'::public.app_role, f.id FROM public.facilities f;
  INSERT INTO public.user_roles (user_id, role, facility_id) VALUES
    (v_admin,  'admin'::public.app_role,  v_sunrise),
    (v_staff,  'staff'::public.app_role,  v_sunrise),
    (v_family, 'family'::public.app_role, NULL);

  -- Caregiver is assigned to every Sunrise resident.
  DELETE FROM public.resident_staff WHERE user_id = v_staff;
  INSERT INTO public.resident_staff (resident_id, user_id, facility_id)
    SELECT r2.id, v_staff, v_sunrise FROM public.residents r2 WHERE r2.facility_id = v_sunrise;

  -- Family is linked to Margaret B.
  IF v_margaret IS NOT NULL THEN
    DELETE FROM public.resident_family WHERE user_id = v_family;
    INSERT INTO public.resident_family (resident_id, user_id) VALUES (v_margaret, v_family);
  END IF;
END $$;

-- Verify
SELECT u.email, r.role, f.name AS facility
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
LEFT JOIN public.facilities f ON f.id = r.facility_id
ORDER BY u.email, f.name;
