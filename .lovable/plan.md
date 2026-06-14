## Goal
Redesign `/auth/login` and ship four role-scoped dashboards driven entirely by the DB (no role selection on login).

## 1. Database changes (one migration)
- Add `'super_admin'` to the `app_role` enum.
- Seed: on first sign-in of `leonelbaskin@gmail.com`, ensure a `user_roles` row with `role='super_admin'` (facility_id NULL). Done via a trigger on `auth.users` insert + a one-off `UPDATE` for the existing user if present.
- Update `has_role`-style helpers / RLS so `super_admin` implicitly satisfies anything an `admin` can do, across all facilities. Add `is_super_admin(uid)` SECURITY DEFINER helper.
- Loosen relevant RLS policies on `facilities`, `staff_requests`, `residents`, `posts`, `mood_logs`, `weekly_surveys`, `user_roles`, `invites` so super_admin sees/acts on everything; admin stays scoped to their facility.
- Allow super_admin to `INSERT/UPDATE/DELETE` on `facilities`.

## 2. Login page redesign (`src/routes/auth.login.tsx`)
- Clean, single-column card: email, password, "Sign in".
- Below button: two small links — "Join as Staff" (`/auth/join-staff`) and "Join with invite link" (prompts for token → `/auth/join-family?token=…`).
- Footer link: "Explore without an account →" → `/learn`.
- On submit: sign in, fetch role via `getMyRole`, route:
  - `super_admin` → `/admin` (with facility switcher state defaulting to "All facilities")
  - `admin` → `/admin`
  - `staff` → `/staff`
  - `family` → `/resident`
- Remove any role chooser UI from `/auth` index; that page becomes a thin redirect to `/auth/login`.

## 3. Server functions (`src/lib/app.functions.ts`)
- `getMyRole`: return `{ role, facilityId, isSuperAdmin }`.
- Super-admin-only:
  - `listAllFacilities`, `createFacility({name})`, `deleteFacility({id})`.
  - `listAllStaffRequests` (across facilities).
  - `inviteAdmin` already exists — keep, but allow super_admin to pick any facility; admin restricted to own facility (server-side check).
- Admin (facility-scoped) — already mostly present:
  - `listPendingStaffRequests`, `decideStaffRequest`, `listResidentsForMe`, `createResident` (returns invite link).
- Staff:
  - `listMyAssignedResidents` (only `resident_staff` rows for me).
  - Existing `logTodayMood`, `submitWeeklySurvey`, `createPhotoPost` already work; tighten checks so staff only acts on assigned residents.
- Family:
  - `listMyResidents` (via `resident_family`).
  - `getResidentOverview` already exists; ensure read-only.
- All privileged fns use `assertAdmin` or new `assertSuperAdmin`.

## 4. Dashboards
- `/admin` (`_authenticated.admin.tsx`):
  - If `super_admin`: facility switcher (dropdown: "All facilities" + each facility), tabs: **Staff requests**, **Residents**, **Admins**, **Facilities** (add/remove).
  - If `admin`: same shell minus Facilities tab and switcher; scoped to own facility.
  - Staff requests list with approve/deny (already wired; invite email already sent on approve).
  - Admins tab: existing "Add admin" form; super_admin can pick any facility, admin locked to own.
- `/staff` (`_authenticated.staff.tsx`):
  - List assigned residents (cards). Tap → resident detail view with: mood log (Good/Mixed/Hard), weekly survey form, photo upload with caption.
- `/resident` (`_authenticated.resident.index.tsx`):
  - Cards of linked residents → `/resident/$residentId`.
- `/resident/$residentId` (already exists): keep read-only feed + mood + 8-week chart + alerts + Visit Mode + AI Coach link. Verify no write controls leak.

## 5. Routing guards
- `_authenticated.tsx`: after auth, fetch role once; expose via context. Each dashboard route redirects users whose role doesn't match (e.g. staff hitting `/admin` → their home).

## Technical notes
- Weekly progress chart: use existing `weekly_surveys` data, map enum to numeric (declined=-1, stable=0, improved=1; behaviors none=1, mild=0, significant=-1), render with a small inline SVG or `recharts` (already a dep? — check, else simple SVG).
- Invite links for family: `createResident` already returns a token; show "Copy invite link" on resident creation in admin UI: `${origin}/auth/join-family?token=…`.
- Super-admin bootstrap: `handle_new_user` extended to grant super_admin when `NEW.email = 'leonelbaskin@gmail.com'`; migration also runs a one-off UPSERT for that email if the user already exists.
- All new RLS uses `is_super_admin(auth.uid()) OR <existing predicate>` pattern to avoid breaking current admin/staff/family access.

## Out of scope (confirm if you want these too)
- Email customization / branded invite templates.
- Removing facilities cascades (we'll block delete if residents exist rather than cascade-deleting people).
- AI Coach changes — reuses existing `/learn/coach` flow scoped by resident.

Ready to implement on approval.