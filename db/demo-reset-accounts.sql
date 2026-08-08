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

  -- posts.author_id is NOT NULL and some deployed versions use a foreign-key
  -- definition that information_schema does not reliably expose through the
  -- joins below. Protect it explicitly before any profile or auth deletion.
  IF to_regclass('public.posts') IS NOT NULL THEN
    UPDATE public.posts
       SET author_id = v_staff
     WHERE author_id IS NULL
        OR author_id NOT IN (v_super, v_admin, v_staff, v_family);
  END IF;

  FOR r IN
    -- Read PostgreSQL's constraint catalog directly. The previous
    -- information_schema join could miss a foreign key when constraint names
    -- were reused across schemas, which is exactly what left posts.author_id
    -- pointing at an account being deleted.
    SELECT DISTINCT
      child_ns.nspname AS table_schema,
      child.relname AS table_name,
      child_col.attname AS column_name
    FROM pg_constraint fk
    JOIN pg_class child ON child.oid = fk.conrelid
    JOIN pg_namespace child_ns ON child_ns.oid = child.relnamespace
    JOIN pg_class parent ON parent.oid = fk.confrelid
    JOIN pg_namespace parent_ns ON parent_ns.oid = parent.relnamespace
    JOIN LATERAL unnest(fk.conkey) WITH ORDINALITY AS child_key(attnum, ordinality) ON true
    JOIN pg_attribute child_col
      ON child_col.attrelid = child.oid AND child_col.attnum = child_key.attnum
    WHERE fk.contype = 'f'
      AND child_ns.nspname = 'public'
      AND cardinality(fk.conkey) = 1
      AND (
        (parent_ns.nspname = 'auth' AND parent.relname = 'users')
        OR (parent_ns.nspname = 'public' AND parent.relname = 'profiles')
      )
      AND NOT (child.relname = 'profiles' AND child_col.attname = 'id')
  LOOP
    EXECUTE format(
      'UPDATE %I.%I SET %I = %L WHERE %I IS NOT NULL AND %I NOT IN (%L,%L,%L,%L)',
      r.table_schema, r.table_name, r.column_name, v_staff, r.column_name, r.column_name,
      v_super, v_admin, v_staff, v_family
    );
  END LOOP;

  -- Abort instead of partially deleting accounts if any post still points to
  -- a profile outside the four replacement accounts.
  IF EXISTS (
    SELECT 1 FROM public.posts
     WHERE author_id IS NULL
        OR author_id NOT IN (v_super, v_admin, v_staff, v_family)
  ) THEN
    RAISE EXCEPTION 'Safety check failed: posts.author_id was not fully re-pointed';
  END IF;

  -- Drop leftover profile rows for accounts that are about to disappear.
  DELETE FROM public.profiles
   WHERE id NOT IN (v_super, v_admin, v_staff, v_family);

  -- ------------------------------------------------------- 4. drop old accounts
  DELETE FROM auth.users WHERE id NOT IN (v_super, v_admin, v_staff, v_family);

  -- ------------------------------------------------------ 5. roles/links
  DELETE FROM public.user_roles
   WHERE user_id IN (v_super, v_admin, v_staff, v_family);

  INSERT INTO public.user_roles (user_id, role, facility_id) VALUES
    (v_super,  'super_admin'::public.app_role, NULL),
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

-- Verify: exactly one row should print for each demo account.
SELECT u.email, r.role, f.name AS facility
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
LEFT JOIN public.facilities f ON f.id = r.facility_id
WHERE u.email IN (
  'superadmin@neuratrace.demo',
  'admin@neuratrace.demo',
  'staff@neuratrace.demo',
  'family@neuratrace.demo'
)
ORDER BY u.email, f.name;
