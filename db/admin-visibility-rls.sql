-- =========================================================================
-- Admin visibility without the service key
--
-- The project's privileged service key is revoked, so every read now runs as
-- the signed-in user under row-level security. These policies let facility
-- admins and super admins see the rows their dashboards need.
--
-- Safe to run repeatedly. Paste the whole file into the Cloud SQL editor.
-- =========================================================================

-- Helper: is the user a super admin? SECURITY DEFINER so policies never recurse.
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = 'super_admin'
  )
$$;

-- Helper: does the user administer this facility?
CREATE OR REPLACE FUNCTION public.is_facility_admin(_user_id UUID, _facility_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_super_admin(_user_id)
      OR EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id
          AND role::text = 'admin'
          AND facility_id = _facility_id
      )
$$;

-- Helper: every facility the user administers.
CREATE OR REPLACE FUNCTION public.my_admin_facilities(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT facility_id FROM public.user_roles
  WHERE user_id = _user_id AND role::text = 'admin' AND facility_id IS NOT NULL
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_facility_admin(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_admin_facilities(UUID) TO authenticated;

-- ---------------------------------------------------------------- user_roles
DROP POLICY IF EXISTS "Admins read roles at their facility" ON public.user_roles;
CREATE POLICY "Admins read roles at their facility"
ON public.user_roles FOR SELECT TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR (facility_id IS NOT NULL AND facility_id IN (SELECT public.my_admin_facilities(auth.uid())))
);

DROP POLICY IF EXISTS "Admins manage roles at their facility" ON public.user_roles;
CREATE POLICY "Admins manage roles at their facility"
ON public.user_roles FOR UPDATE TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR (facility_id IS NOT NULL AND facility_id IN (SELECT public.my_admin_facilities(auth.uid())))
)
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR (facility_id IS NOT NULL AND facility_id IN (SELECT public.my_admin_facilities(auth.uid())))
);

DROP POLICY IF EXISTS "Super admins insert roles" ON public.user_roles;
CREATE POLICY "Super admins insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR (facility_id IS NOT NULL AND facility_id IN (SELECT public.my_admin_facilities(auth.uid())))
);

-- ------------------------------------------------------------------ profiles
DROP POLICY IF EXISTS "Admins read profiles at their facility" ON public.profiles;
CREATE POLICY "Admins read profiles at their facility"
ON public.profiles FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR public.is_super_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = public.profiles.id
      AND ur.facility_id IS NOT NULL
      AND ur.facility_id IN (SELECT public.my_admin_facilities(auth.uid()))
  )
);

-- -------------------------------------------------------------- login_events
DROP POLICY IF EXISTS "Admins read login events" ON public.login_events;
CREATE POLICY "Admins read login events"
ON public.login_events FOR SELECT TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR (facility_id IS NOT NULL AND facility_id IN (SELECT public.my_admin_facilities(auth.uid())))
);

DROP POLICY IF EXISTS "Users record their own login" ON public.login_events;
CREATE POLICY "Users record their own login"
ON public.login_events FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------- facilities
DROP POLICY IF EXISTS "Super admins write facilities" ON public.facilities;
CREATE POLICY "Super admins write facilities"
ON public.facilities FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- ----------------------------------------------------------------- residents
DROP POLICY IF EXISTS "Admins manage residents at their facility" ON public.residents;
CREATE POLICY "Admins manage residents at their facility"
ON public.residents FOR ALL TO authenticated
USING (public.is_facility_admin(auth.uid(), facility_id))
WITH CHECK (public.is_facility_admin(auth.uid(), facility_id));

-- ------------------------------------------------------------------- grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.login_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.facilities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.residents TO authenticated;
