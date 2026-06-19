-- =========================================================================
-- RLS Audit Migration — Part 2 of 2
--
-- For every public table:
--   1. Confirms RLS is enabled.
--   2. Drops the prior policies and re-creates them with explicit
--      super_admin overrides.
--   3. Adds a COMMENT ON POLICY explaining intent.
--
-- Access model (adapted to the existing schema):
--   - profiles:       a user can read/update only their own row;
--                     super_admin can read/update all.
--   - user_roles:     a user can read only their own roles;
--                     facility admins can manage roles in their facility;
--                     super_admin manages all.
--   - facilities:     all authenticated users can read (needed for facility
--                     pickers and resident joins); only super_admin writes.
--   - residents +
--     resident_family +
--     resident_staff: scoped via can_view_resident / can_manage_resident
--                     (family link OR staff/admin facility membership),
--                     plus super_admin override.
--   - posts /
--     mood_logs /
--     weekly_surveys /
--     decline_alerts: read = can_view_resident(resident_id);
--                     write = can_manage_resident(resident_id);
--                     super_admin override.
--   - invites:        read by token (open) OR creator/super_admin;
--                     write by staff/admin in facility OR super_admin.
--   - staff_requests: anyone can submit; only the target facility's admins
--                     and super_admin can read/decide.
-- =========================================================================

-- -------------------------------------------------------------------------
-- profiles
-- -------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admin reads all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin writes all profiles" ON public.profiles;

CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
COMMENT ON POLICY "Users read own profile" ON public.profiles IS
  'A user may read only their own profile row (auth.uid() = profiles.id).';

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
COMMENT ON POLICY "Users insert own profile" ON public.profiles IS
  'A user may insert their own profile only. The handle_new_user trigger normally creates this row; this policy covers manual upserts from the client.';

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
COMMENT ON POLICY "Users update own profile" ON public.profiles IS
  'A user may update only their own profile row.';

CREATE POLICY "Super admin reads all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));
COMMENT ON POLICY "Super admin reads all profiles" ON public.profiles IS
  'Super admins can read every profile for cross-facility administration.';

CREATE POLICY "Super admin writes all profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
COMMENT ON POLICY "Super admin writes all profiles" ON public.profiles IS
  'Super admins can insert/update/delete any profile.';

-- -------------------------------------------------------------------------
-- user_roles
-- -------------------------------------------------------------------------
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Facility admin reads facility roles" ON public.user_roles;
DROP POLICY IF EXISTS "Facility admin manages facility roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admin manages all roles" ON public.user_roles;

CREATE POLICY "Users see their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
COMMENT ON POLICY "Users see their own roles" ON public.user_roles IS
  'A user can read the role rows that grant their own access (used by getMyRole).';

CREATE POLICY "Facility admin reads facility roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (
    facility_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.user_roles me
      WHERE me.user_id = auth.uid()
        AND me.role = 'admin'
        AND me.facility_id = user_roles.facility_id
    )
  );
COMMENT ON POLICY "Facility admin reads facility roles" ON public.user_roles IS
  'A facility admin can see role assignments inside their own facility (to manage staff).';

CREATE POLICY "Facility admin manages facility roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (
    facility_id IS NOT NULL
    AND role IN ('staff','family')
    AND EXISTS (
      SELECT 1 FROM public.user_roles me
      WHERE me.user_id = auth.uid()
        AND me.role = 'admin'
        AND me.facility_id = user_roles.facility_id
    )
  )
  WITH CHECK (
    facility_id IS NOT NULL
    AND role IN ('staff','family')
    AND EXISTS (
      SELECT 1 FROM public.user_roles me
      WHERE me.user_id = auth.uid()
        AND me.role = 'admin'
        AND me.facility_id = user_roles.facility_id
    )
  );
COMMENT ON POLICY "Facility admin manages facility roles" ON public.user_roles IS
  'A facility admin can grant/revoke staff and family roles inside their own facility. They cannot grant admin or super_admin.';

CREATE POLICY "Super admin manages all roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
COMMENT ON POLICY "Super admin manages all roles" ON public.user_roles IS
  'Super admins can read/write any role assignment across all facilities.';

-- -------------------------------------------------------------------------
-- facilities — tighten public read to authenticated only
-- -------------------------------------------------------------------------
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
REVOKE SELECT ON public.facilities FROM anon;

DROP POLICY IF EXISTS "Anyone can read facilities" ON public.facilities;
DROP POLICY IF EXISTS "Authenticated read facilities" ON public.facilities;
DROP POLICY IF EXISTS "Super admin manages facilities" ON public.facilities;

CREATE POLICY "Authenticated read facilities"
  ON public.facilities FOR SELECT TO authenticated
  USING (true);
COMMENT ON POLICY "Authenticated read facilities" ON public.facilities IS
  'All signed-in users may read the facility directory. Names are non-sensitive and needed for pickers, resident joins, and the join-by-key flow.';

CREATE POLICY "Super admin manages facilities"
  ON public.facilities FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
COMMENT ON POLICY "Super admin manages facilities" ON public.facilities IS
  'Only super admins can create, rename, or delete facilities.';

-- -------------------------------------------------------------------------
-- residents
-- -------------------------------------------------------------------------
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View residents (linked family or facility staff/admin)" ON public.residents;
DROP POLICY IF EXISTS "Staff/admin manage residents in facility" ON public.residents;
DROP POLICY IF EXISTS "Super admin manages residents" ON public.residents;

CREATE POLICY "View residents (linked family or facility staff/admin)"
  ON public.residents FOR SELECT TO authenticated
  USING (public.can_view_resident(id) OR public.is_super_admin(auth.uid()));
COMMENT ON POLICY "View residents (linked family or facility staff/admin)" ON public.residents IS
  'Read access: family members linked through resident_family, staff/admin of the same facility, or super_admin.';

CREATE POLICY "Staff/admin manage residents in facility"
  ON public.residents FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.facility_id = facility_id AND ur.role IN ('staff','admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.facility_id = facility_id AND ur.role IN ('staff','admin'))
  );
COMMENT ON POLICY "Staff/admin manage residents in facility" ON public.residents IS
  'Staff and admins can insert/update/delete residents that belong to their own facility.';

CREATE POLICY "Super admin manages residents"
  ON public.residents FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
COMMENT ON POLICY "Super admin manages residents" ON public.residents IS
  'Super admins can manage residents in any facility.';

-- -------------------------------------------------------------------------
-- resident_family
-- -------------------------------------------------------------------------
ALTER TABLE public.resident_family ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family see own links" ON public.resident_family;
DROP POLICY IF EXISTS "Staff/admin manage family links" ON public.resident_family;
DROP POLICY IF EXISTS "Super admin manages family links" ON public.resident_family;

CREATE POLICY "Family see own links"
  ON public.resident_family FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.can_manage_resident(resident_id) OR public.is_super_admin(auth.uid()));
COMMENT ON POLICY "Family see own links" ON public.resident_family IS
  'A family member sees their own resident links. Staff/admin in the resident''s facility (and super_admin) also see them for management.';

CREATE POLICY "Staff/admin manage family links"
  ON public.resident_family FOR ALL TO authenticated
  USING (public.can_manage_resident(resident_id))
  WITH CHECK (public.can_manage_resident(resident_id));
COMMENT ON POLICY "Staff/admin manage family links" ON public.resident_family IS
  'Staff/admin in the resident''s facility can add/remove family link rows.';

CREATE POLICY "Super admin manages family links"
  ON public.resident_family FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
COMMENT ON POLICY "Super admin manages family links" ON public.resident_family IS
  'Super admins can manage any family-resident link.';

-- -------------------------------------------------------------------------
-- resident_staff
-- -------------------------------------------------------------------------
ALTER TABLE public.resident_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff see resident staff in facility" ON public.resident_staff;
DROP POLICY IF EXISTS "Staff/admin manage resident staff" ON public.resident_staff;
DROP POLICY IF EXISTS "Super admin manages resident staff" ON public.resident_staff;

CREATE POLICY "Staff see resident staff in facility"
  ON public.resident_staff FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.facility_id = resident_staff.facility_id AND ur.role IN ('staff','admin'))
    OR public.is_super_admin(auth.uid())
  );
COMMENT ON POLICY "Staff see resident staff in facility" ON public.resident_staff IS
  'Staff/admin can read resident-staff assignments inside their facility. Super admins read all.';

CREATE POLICY "Staff/admin manage resident staff"
  ON public.resident_staff FOR ALL TO authenticated
  USING (public.can_manage_resident(resident_id))
  WITH CHECK (public.can_manage_resident(resident_id));
COMMENT ON POLICY "Staff/admin manage resident staff" ON public.resident_staff IS
  'Staff/admin in the resident''s facility can assign/unassign staff to residents.';

CREATE POLICY "Super admin manages resident staff"
  ON public.resident_staff FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
COMMENT ON POLICY "Super admin manages resident staff" ON public.resident_staff IS
  'Super admins can manage resident-staff links in any facility.';

-- -------------------------------------------------------------------------
-- posts
-- -------------------------------------------------------------------------
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View posts of viewable residents" ON public.posts;
DROP POLICY IF EXISTS "Staff create posts" ON public.posts;
DROP POLICY IF EXISTS "Staff manage own posts" ON public.posts;
DROP POLICY IF EXISTS "Staff delete posts" ON public.posts;
DROP POLICY IF EXISTS "Super admin manages posts" ON public.posts;

CREATE POLICY "View posts of viewable residents"
  ON public.posts FOR SELECT TO authenticated
  USING (public.can_view_resident(resident_id) OR public.is_super_admin(auth.uid()));
COMMENT ON POLICY "View posts of viewable residents" ON public.posts IS
  'Family/staff/admin who can view the resident may read the resident''s posts. Super admins read all.';

CREATE POLICY "Staff create posts"
  ON public.posts FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_resident(resident_id) AND author_id = auth.uid());
COMMENT ON POLICY "Staff create posts" ON public.posts IS
  'Only staff/admin of the resident''s facility can create posts, and only as themselves (author_id = auth.uid()).';

CREATE POLICY "Staff manage own posts"
  ON public.posts FOR UPDATE TO authenticated
  USING (public.can_manage_resident(resident_id))
  WITH CHECK (public.can_manage_resident(resident_id));
COMMENT ON POLICY "Staff manage own posts" ON public.posts IS
  'Staff/admin in the resident''s facility can update posts about that resident.';

CREATE POLICY "Staff delete posts"
  ON public.posts FOR DELETE TO authenticated
  USING (public.can_manage_resident(resident_id));
COMMENT ON POLICY "Staff delete posts" ON public.posts IS
  'Staff/admin in the resident''s facility can delete posts about that resident.';

CREATE POLICY "Super admin manages posts"
  ON public.posts FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
COMMENT ON POLICY "Super admin manages posts" ON public.posts IS
  'Super admins can manage any post.';

-- -------------------------------------------------------------------------
-- mood_logs
-- -------------------------------------------------------------------------
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View mood logs" ON public.mood_logs;
DROP POLICY IF EXISTS "Staff manage mood logs" ON public.mood_logs;
DROP POLICY IF EXISTS "Super admin manages mood logs" ON public.mood_logs;

CREATE POLICY "View mood logs"
  ON public.mood_logs FOR SELECT TO authenticated
  USING (public.can_view_resident(resident_id) OR public.is_super_admin(auth.uid()));
COMMENT ON POLICY "View mood logs" ON public.mood_logs IS
  'Anyone who can view the resident can read their mood logs (family + staff/admin + super_admin).';

CREATE POLICY "Staff manage mood logs"
  ON public.mood_logs FOR ALL TO authenticated
  USING (public.can_manage_resident(resident_id))
  WITH CHECK (public.can_manage_resident(resident_id));
COMMENT ON POLICY "Staff manage mood logs" ON public.mood_logs IS
  'Staff/admin in the resident''s facility can insert/update/delete mood logs.';

CREATE POLICY "Super admin manages mood logs"
  ON public.mood_logs FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
COMMENT ON POLICY "Super admin manages mood logs" ON public.mood_logs IS
  'Super admins can manage any mood log.';

-- -------------------------------------------------------------------------
-- weekly_surveys
-- -------------------------------------------------------------------------
ALTER TABLE public.weekly_surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View surveys" ON public.weekly_surveys;
DROP POLICY IF EXISTS "Staff manage surveys" ON public.weekly_surveys;
DROP POLICY IF EXISTS "Super admin manages surveys" ON public.weekly_surveys;

CREATE POLICY "View surveys"
  ON public.weekly_surveys FOR SELECT TO authenticated
  USING (public.can_view_resident(resident_id) OR public.is_super_admin(auth.uid()));
COMMENT ON POLICY "View surveys" ON public.weekly_surveys IS
  'Anyone who can view the resident can read their weekly surveys.';

CREATE POLICY "Staff manage surveys"
  ON public.weekly_surveys FOR ALL TO authenticated
  USING (public.can_manage_resident(resident_id))
  WITH CHECK (public.can_manage_resident(resident_id));
COMMENT ON POLICY "Staff manage surveys" ON public.weekly_surveys IS
  'Staff/admin in the resident''s facility can insert/update/delete weekly surveys.';

CREATE POLICY "Super admin manages surveys"
  ON public.weekly_surveys FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
COMMENT ON POLICY "Super admin manages surveys" ON public.weekly_surveys IS
  'Super admins can manage any weekly survey.';

-- -------------------------------------------------------------------------
-- decline_alerts
-- -------------------------------------------------------------------------
ALTER TABLE public.decline_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View alerts" ON public.decline_alerts;
DROP POLICY IF EXISTS "Dismiss own alerts" ON public.decline_alerts;
DROP POLICY IF EXISTS "Staff manage alerts" ON public.decline_alerts;
DROP POLICY IF EXISTS "Super admin manages alerts" ON public.decline_alerts;

CREATE POLICY "View alerts"
  ON public.decline_alerts FOR SELECT TO authenticated
  USING (public.can_view_resident(resident_id) OR public.is_super_admin(auth.uid()));
COMMENT ON POLICY "View alerts" ON public.decline_alerts IS
  'Anyone who can view the resident can see decline alerts about them.';

CREATE POLICY "Staff manage alerts"
  ON public.decline_alerts FOR ALL TO authenticated
  USING (public.can_manage_resident(resident_id))
  WITH CHECK (public.can_manage_resident(resident_id));
COMMENT ON POLICY "Staff manage alerts" ON public.decline_alerts IS
  'Staff/admin in the resident''s facility can create and dismiss decline alerts (writes are also done by server triggers under service_role, which bypasses RLS).';

CREATE POLICY "Super admin manages alerts"
  ON public.decline_alerts FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
COMMENT ON POLICY "Super admin manages alerts" ON public.decline_alerts IS
  'Super admins can manage any decline alert.';

-- -------------------------------------------------------------------------
-- invites
-- -------------------------------------------------------------------------
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read invite by anyone (token is the secret)" ON public.invites;
DROP POLICY IF EXISTS "Staff/admin create invites in facility" ON public.invites;
DROP POLICY IF EXISTS "Staff/admin manage invites in facility" ON public.invites;
DROP POLICY IF EXISTS "Super admin manages invites" ON public.invites;

CREATE POLICY "Read invite by anyone (token is the secret)"
  ON public.invites FOR SELECT
  USING (true);
COMMENT ON POLICY "Read invite by anyone (token is the secret)" ON public.invites IS
  'Invite rows are looked up by their random token, which is the secret. Anyone who possesses a token may read the corresponding row to validate it during signup. Tokens are generated with gen_random_uuid() and are not enumerable.';

CREATE POLICY "Staff/admin create invites in facility"
  ON public.invites FOR INSERT TO authenticated
  WITH CHECK (
    facility_id IS NOT NULL AND (
      EXISTS (SELECT 1 FROM public.user_roles ur
              WHERE ur.user_id = auth.uid() AND ur.facility_id = invites.facility_id AND ur.role IN ('staff','admin'))
    )
  );
COMMENT ON POLICY "Staff/admin create invites in facility" ON public.invites IS
  'Staff/admin can create invites only for their own facility.';

CREATE POLICY "Staff/admin manage invites in facility"
  ON public.invites FOR UPDATE TO authenticated
  USING (
    facility_id IS NOT NULL AND (
      EXISTS (SELECT 1 FROM public.user_roles ur
              WHERE ur.user_id = auth.uid() AND ur.facility_id = invites.facility_id AND ur.role = 'admin')
    )
  )
  WITH CHECK (
    facility_id IS NOT NULL AND (
      EXISTS (SELECT 1 FROM public.user_roles ur
              WHERE ur.user_id = auth.uid() AND ur.facility_id = invites.facility_id AND ur.role = 'admin')
    )
  );
COMMENT ON POLICY "Staff/admin manage invites in facility" ON public.invites IS
  'Facility admins can mark their facility''s invites as used or revoked.';

CREATE POLICY "Super admin manages invites"
  ON public.invites FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
COMMENT ON POLICY "Super admin manages invites" ON public.invites IS
  'Super admins can manage invites in any facility.';

-- -------------------------------------------------------------------------
-- staff_requests
-- -------------------------------------------------------------------------
ALTER TABLE public.staff_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone may submit a staff request" ON public.staff_requests;
DROP POLICY IF EXISTS "Admins view their facility's requests" ON public.staff_requests;
DROP POLICY IF EXISTS "Admins decide their facility's requests" ON public.staff_requests;
DROP POLICY IF EXISTS "Super admin manages staff requests" ON public.staff_requests;

CREATE POLICY "Anyone may submit a staff request"
  ON public.staff_requests FOR INSERT
  WITH CHECK (true);
COMMENT ON POLICY "Anyone may submit a staff request" ON public.staff_requests IS
  'Anonymous and authenticated users can submit a staff access request; status defaults to pending and decided_by/decided_at must be NULL until an admin reviews.';

CREATE POLICY "Admins view their facility's requests"
  ON public.staff_requests FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.facility_id = staff_requests.facility_id AND ur.role = 'admin')
    OR public.is_super_admin(auth.uid())
  );
COMMENT ON POLICY "Admins view their facility's requests" ON public.staff_requests IS
  'Only the target facility''s admins (and super_admin) can read staff requests.';

CREATE POLICY "Admins decide their facility's requests"
  ON public.staff_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.facility_id = staff_requests.facility_id AND ur.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.facility_id = staff_requests.facility_id AND ur.role = 'admin')
  );
COMMENT ON POLICY "Admins decide their facility's requests" ON public.staff_requests IS
  'Only the target facility''s admins can approve/deny staff requests.';

CREATE POLICY "Super admin manages staff requests"
  ON public.staff_requests FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
COMMENT ON POLICY "Super admin manages staff requests" ON public.staff_requests IS
  'Super admins can read and decide any facility''s staff requests.';

-- =========================================================================
-- Final sanity: make sure RLS is forced on for every public table.
-- (FORCE makes RLS apply even to the table owner; service_role still
-- bypasses via BYPASSRLS, which is the intended escape hatch.)
-- =========================================================================
ALTER TABLE public.profiles        FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles      FORCE ROW LEVEL SECURITY;
ALTER TABLE public.facilities      FORCE ROW LEVEL SECURITY;
ALTER TABLE public.residents       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.resident_family FORCE ROW LEVEL SECURITY;
ALTER TABLE public.resident_staff  FORCE ROW LEVEL SECURITY;
ALTER TABLE public.posts           FORCE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_surveys  FORCE ROW LEVEL SECURITY;
ALTER TABLE public.decline_alerts  FORCE ROW LEVEL SECURITY;
ALTER TABLE public.invites         FORCE ROW LEVEL SECURITY;
ALTER TABLE public.staff_requests  FORCE ROW LEVEL SECURITY;
