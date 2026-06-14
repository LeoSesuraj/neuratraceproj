
-- 1. Add super_admin to enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- (need separate transaction-bounded statements for enum use; wrap rest in DO blocks where needed)
COMMIT;
BEGIN;

-- 2. has_role: super_admin counts as admin (and as super_admin)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        role = _role
        OR (_role = 'admin'::app_role AND role = 'super_admin'::app_role)
      )
  )
$$;

-- 3. is_super_admin helper
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'::app_role
  )
$$;

-- 4. handle_new_user: also seed super_admin for the designated email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email))
  ON CONFLICT (id) DO NOTHING;

  IF lower(NEW.email) = 'leonelbaskin@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role, facility_id)
    VALUES (NEW.id, 'super_admin'::app_role, NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 5. One-off: grant super_admin to existing user if present
INSERT INTO public.user_roles (user_id, role, facility_id)
SELECT id, 'super_admin'::app_role, NULL
FROM auth.users
WHERE lower(email) = 'leonelbaskin@gmail.com'
ON CONFLICT DO NOTHING;

-- 6. Facilities: allow super_admin full CRUD; keep public SELECT
DROP POLICY IF EXISTS "Super admin manages facilities" ON public.facilities;
CREATE POLICY "Super admin manages facilities"
  ON public.facilities
  FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- 7. staff_requests: let super_admin view + decide across facilities
DROP POLICY IF EXISTS "Super admin views all staff requests" ON public.staff_requests;
CREATE POLICY "Super admin views all staff requests"
  ON public.staff_requests
  FOR SELECT
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin decides all staff requests" ON public.staff_requests;
CREATE POLICY "Super admin decides all staff requests"
  ON public.staff_requests
  FOR UPDATE
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- 8. residents: let super_admin view + manage everything
DROP POLICY IF EXISTS "Super admin views all residents" ON public.residents;
CREATE POLICY "Super admin views all residents"
  ON public.residents
  FOR SELECT
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin manages all residents" ON public.residents;
CREATE POLICY "Super admin manages all residents"
  ON public.residents
  FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

COMMIT;
BEGIN;
