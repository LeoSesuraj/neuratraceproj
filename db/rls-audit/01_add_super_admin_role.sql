-- =========================================================================
-- RLS Audit Migration — Part 1 of 2
--
-- Adds the `super_admin` role value + `is_super_admin()` helper. This MUST
-- run in its own migration because PostgreSQL forbids using a new enum value
-- in the same transaction it was added in.
--
-- Apply with: paste into the Lovable Cloud migration tool (or `supabase
-- migration new add_super_admin_role` + this body), commit, then apply
-- part 2 in a separate migration.
-- =========================================================================

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- SECURITY DEFINER so it can read user_roles regardless of the caller's RLS
-- and so policies that call it never recurse.
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

COMMENT ON FUNCTION public.is_super_admin(UUID) IS
  'Returns true when the user holds the super_admin role. Used by every table policy as an unconditional bypass for platform operators.';
