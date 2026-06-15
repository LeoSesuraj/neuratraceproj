# Role-Based App: Super Admin + Facility Admin + Staff + Family

## 1. Database changes (migration)

- Add `super_admin` value to existing `app_role` enum.
- Keep existing `admin` role, treated as **Facility Admin** (scoped by `facility_id` in `user_roles`).
- Add helper SQL function `is_super_admin(uid)` for RLS shortcuts.
- Update RLS policies on `facilities`, `residents`, `user_roles`, `staff_requests`, `invites`, `posts`, `mood_logs`, `weekly_surveys`, `decline_alerts`:
  - Super admin: full read/write everywhere.
  - Facility admin: read/write scoped to their `facility_id`.
  - Staff: scoped to residents in `resident_staff`.
  - Family: read-only scoped to residents in `resident_family`.

## 2. Server functions (`src/lib/app.functions.ts`)

Add/modify:
- `getMyRole` returns `{ role, facilityId, isSuperAdmin }`.
- Super-admin-only:
  - `listAllFacilities`, `createFacility`, `deleteFacility`
  - `listAllStaffRequests` (across facilities)
  - `createFacilityAdmin({ email, facility_id })` → invites email + assigns admin role
  - `listAllResidents`
- Facility-admin-only: existing `listPendingStaffRequests` / `decideStaffRequest` already facility-scoped via RLS; tighten to current admin's facility.
- Staff scope check on `logTodayMood`, `submitWeeklySurvey`, `createPhotoPost` — only assigned residents.
- Family read-only enforced in `getResidentOverview`.

## 3. Routing

After login (`auth.login.tsx` + `index.tsx` inline form), navigate based on role:
- `super_admin` → `/admin/super`
- `admin` → `/admin`
- `staff` → `/staff`
- `family` → `/resident`

New routes:
- `src/routes/_authenticated.admin.super.tsx` — Super Admin dashboard with tabs: Facilities, Staff Requests, Facility Admins, Residents.
- Update `_authenticated.admin.tsx` — Facility Admin: staff requests (own facility), residents list/create, invite copy link, invite other admins.
- `_authenticated.staff.tsx` — Staff: only assigned residents, post photo, daily mood, weekly survey.
- `_authenticated.resident.*` — Family: resident cards → feed (photos, today mood pill, 8-week graph, decline banners), Visit Mode, AI Coach link.

## 4. Seed test accounts (migration with `auth.users` inserts)

Created via SQL using `auth.admin` via a one-time seeding migration, with `user_roles` and link rows:

| Role | Email | Password |
|---|---|---|
| Super Admin | leonelbaskin@gmail.com | SuperAdmin123! |
| Facility Admin | admin@demo.test | Admin123! |
| Staff | staff@demo.test | Staff123! |
| Family | family@demo.test | Family123! |

Plus seed:
- 2 facilities: "Sunrise Care" (admin/staff/family assigned), "Maple Grove"
- 2 residents in Sunrise: "Eleanor Hayes", "Walter Chen" — both assigned to staff@demo.test; family@demo.test linked to Eleanor.
- Sample posts, mood logs, weekly surveys so the feed/graph render.

## 5. UI touches

- Role-aware nav in `app-shell.tsx` showing only allowed sections.
- Facility switcher dropdown for super admin (persists in URL search param `?facility=`).
- Visit Mode + today-mood pill (green/yellow/red) + 8-week line chart (recharts already in deps) on resident feed.

## Technical notes

- Super admin RLS uses `is_super_admin(auth.uid())` to bypass facility scoping in policies.
- Seeded user passwords use Supabase auth admin `createUser` inside a SQL migration via `supabase_auth_admin` extension calls — wrapped in `DO $$ ... $$` block that's idempotent (`ON CONFLICT DO NOTHING`).
- All new tables/columns get matching `GRANT`s for `authenticated` + `service_role`.
- Routes under `_authenticated/admin/super` gated by `getMyRole` returning `super_admin`; redirect otherwise.

Ready to implement on approval.
