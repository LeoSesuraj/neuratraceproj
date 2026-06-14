
-- =========================================
-- Roles
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'family');

CREATE TABLE public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.facilities TO anon, authenticated;
GRANT ALL ON public.facilities TO service_role;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read facilities" ON public.facilities FOR SELECT USING (true);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, facility_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.user_facility(_user_id UUID)
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT facility_id FROM public.user_roles WHERE user_id = _user_id AND facility_id IS NOT NULL LIMIT 1
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- Residents
-- =========================================
CREATE TABLE public.residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  date_of_birth DATE,
  dementia_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.residents TO authenticated;
GRANT ALL ON public.residents TO service_role;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.resident_family (
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (resident_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.resident_family TO authenticated;
GRANT ALL ON public.resident_family TO service_role;
ALTER TABLE public.resident_family ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.resident_staff (
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (resident_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.resident_staff TO authenticated;
GRANT ALL ON public.resident_staff TO service_role;
ALTER TABLE public.resident_staff ENABLE ROW LEVEL SECURITY;

-- Helper: can the current user see this resident?
CREATE OR REPLACE FUNCTION public.can_view_resident(_resident_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.resident_family rf WHERE rf.resident_id = _resident_id AND rf.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.residents r
    JOIN public.user_roles ur ON ur.facility_id = r.facility_id
    WHERE r.id = _resident_id
      AND ur.user_id = auth.uid()
      AND ur.role IN ('staff','admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.can_manage_resident(_resident_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.residents r
    JOIN public.user_roles ur ON ur.facility_id = r.facility_id
    WHERE r.id = _resident_id
      AND ur.user_id = auth.uid()
      AND ur.role IN ('staff','admin')
  )
$$;

-- Residents policies
CREATE POLICY "View residents (linked family or facility staff/admin)" ON public.residents
  FOR SELECT TO authenticated USING (public.can_view_resident(id));
CREATE POLICY "Staff/admin manage residents in facility" ON public.residents
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.facility_id = facility_id AND ur.role IN ('staff','admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.facility_id = facility_id AND ur.role IN ('staff','admin'))
  );

-- resident_family policies
CREATE POLICY "Family see own links" ON public.resident_family FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.can_manage_resident(resident_id));
CREATE POLICY "Staff/admin manage family links" ON public.resident_family FOR ALL TO authenticated
  USING (public.can_manage_resident(resident_id))
  WITH CHECK (public.can_manage_resident(resident_id));

-- resident_staff policies
CREATE POLICY "Staff see resident staff in facility" ON public.resident_staff FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.facility_id = resident_staff.facility_id AND ur.role IN ('staff','admin'))
  );
CREATE POLICY "Staff/admin manage resident staff" ON public.resident_staff FOR ALL TO authenticated
  USING (public.can_manage_resident(resident_id))
  WITH CHECK (public.can_manage_resident(resident_id));

-- =========================================
-- Posts / mood logs / weekly surveys
-- =========================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  photo_url TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View posts of viewable residents" ON public.posts FOR SELECT TO authenticated
  USING (public.can_view_resident(resident_id));
CREATE POLICY "Staff create posts" ON public.posts FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_resident(resident_id) AND author_id = auth.uid());
CREATE POLICY "Staff manage own posts" ON public.posts FOR UPDATE TO authenticated
  USING (public.can_manage_resident(resident_id));
CREATE POLICY "Staff delete posts" ON public.posts FOR DELETE TO authenticated
  USING (public.can_manage_resident(resident_id));

CREATE TYPE public.mood_kind AS ENUM ('good','mixed','hard');
CREATE TABLE public.mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  logged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  mood public.mood_kind NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (resident_id, log_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mood_logs TO authenticated;
GRANT ALL ON public.mood_logs TO service_role;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View mood logs" ON public.mood_logs FOR SELECT TO authenticated
  USING (public.can_view_resident(resident_id));
CREATE POLICY "Staff manage mood logs" ON public.mood_logs FOR ALL TO authenticated
  USING (public.can_manage_resident(resident_id))
  WITH CHECK (public.can_manage_resident(resident_id));

CREATE TYPE public.survey_rating AS ENUM ('improved','stable','declined');
CREATE TYPE public.behavior_rating AS ENUM ('none','mild','significant');

CREATE TABLE public.weekly_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  week_of DATE NOT NULL,
  eating public.survey_rating NOT NULL,
  mood public.survey_rating NOT NULL,
  social public.survey_rating NOT NULL,
  mobility public.survey_rating NOT NULL,
  behaviors public.behavior_rating NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (resident_id, week_of)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_surveys TO authenticated;
GRANT ALL ON public.weekly_surveys TO service_role;
ALTER TABLE public.weekly_surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View surveys" ON public.weekly_surveys FOR SELECT TO authenticated
  USING (public.can_view_resident(resident_id));
CREATE POLICY "Staff manage surveys" ON public.weekly_surveys FOR ALL TO authenticated
  USING (public.can_manage_resident(resident_id))
  WITH CHECK (public.can_manage_resident(resident_id));

CREATE TABLE public.decline_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dismissed_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX decline_alerts_active_unique ON public.decline_alerts (resident_id, category) WHERE dismissed_at IS NULL;
GRANT SELECT, INSERT, UPDATE ON public.decline_alerts TO authenticated;
GRANT ALL ON public.decline_alerts TO service_role;
ALTER TABLE public.decline_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View alerts" ON public.decline_alerts FOR SELECT TO authenticated
  USING (public.can_view_resident(resident_id));
CREATE POLICY "Dismiss own alerts" ON public.decline_alerts FOR UPDATE TO authenticated
  USING (public.can_view_resident(resident_id));

-- Decline detection trigger: when a new survey records "declined" (or "significant" for behaviors),
-- and the immediately prior survey did too, raise an active alert.
CREATE OR REPLACE FUNCTION public.check_decline_alerts()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  prev RECORD;
BEGIN
  SELECT * INTO prev FROM public.weekly_surveys
    WHERE resident_id = NEW.resident_id AND week_of < NEW.week_of
    ORDER BY week_of DESC LIMIT 1;
  IF prev IS NULL THEN RETURN NEW; END IF;

  IF NEW.eating = 'declined' AND prev.eating = 'declined' THEN
    INSERT INTO public.decline_alerts (resident_id, category) VALUES (NEW.resident_id, 'eating')
    ON CONFLICT DO NOTHING;
  END IF;
  IF NEW.mood = 'declined' AND prev.mood = 'declined' THEN
    INSERT INTO public.decline_alerts (resident_id, category) VALUES (NEW.resident_id, 'mood')
    ON CONFLICT DO NOTHING;
  END IF;
  IF NEW.social = 'declined' AND prev.social = 'declined' THEN
    INSERT INTO public.decline_alerts (resident_id, category) VALUES (NEW.resident_id, 'social')
    ON CONFLICT DO NOTHING;
  END IF;
  IF NEW.mobility = 'declined' AND prev.mobility = 'declined' THEN
    INSERT INTO public.decline_alerts (resident_id, category) VALUES (NEW.resident_id, 'mobility')
    ON CONFLICT DO NOTHING;
  END IF;
  IF NEW.behaviors = 'significant' AND prev.behaviors = 'significant' THEN
    INSERT INTO public.decline_alerts (resident_id, category) VALUES (NEW.resident_id, 'behaviors')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER weekly_surveys_decline_check
AFTER INSERT ON public.weekly_surveys
FOR EACH ROW EXECUTE FUNCTION public.check_decline_alerts();

-- =========================================
-- Invites & staff requests
-- =========================================
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  role public.app_role NOT NULL,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  used BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.invites TO authenticated;
GRANT ALL ON public.invites TO service_role;
-- anon needs to look up an invite by token during family signup
GRANT SELECT ON public.invites TO anon;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read invite by anyone (token is the secret)" ON public.invites
  FOR SELECT USING (true);
CREATE POLICY "Staff/admin create invites in facility" ON public.invites FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.facility_id = invites.facility_id AND ur.role IN ('staff','admin'))
  );

CREATE TYPE public.staff_request_status AS ENUM ('pending','approved','denied');
CREATE TABLE public.staff_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  status public.staff_request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT, INSERT, UPDATE ON public.staff_requests TO authenticated;
GRANT INSERT ON public.staff_requests TO anon;
GRANT ALL ON public.staff_requests TO service_role;
ALTER TABLE public.staff_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone may submit a staff request" ON public.staff_requests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view their facility's requests" ON public.staff_requests FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.facility_id = staff_requests.facility_id AND ur.role = 'admin')
  );
CREATE POLICY "Admins decide their facility's requests" ON public.staff_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.facility_id = staff_requests.facility_id AND ur.role = 'admin')
  );

-- Seed a few example facilities for development
INSERT INTO public.facilities (name) VALUES
  ('Sunrise Manor'),
  ('Willow Creek Care Home'),
  ('Lakeside Memory Center');
