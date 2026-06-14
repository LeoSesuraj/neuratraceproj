# Plan: Two-Module App with Auth, Roles, and Resident Tracking

This is a large change. I'll break it into phases so we can ship and verify incrementally. Each phase ends in a working app.

---

## Phase 0 — Enable Lovable Cloud
Required for auth, database, storage, and 2FA. Provisions Supabase under the hood.

## Phase 1 — Restructure into Learn module
Move all current content (Connect, Understand, Journey, Support, AI Coach) under `/learn/*` with no behavior changes. Update `AppShell` nav to scope to Learn tabs. Root `/` becomes the new login/landing screen.

- Move routes: `connect.*` → `learn.connect.*`, `understand.*` → `learn.understand.*`, `journey.tsx` → `learn.journey.tsx`, `support.*` → `learn.support.*`, `coach.*` → `learn.coach.*`
- Update all internal `<Link to=...>` and AppShell tabs
- New route `/learn` = current home content (entry to Learn module)

## Phase 2 — Database schema
One migration creating all tables with RLS + grants:
- `facilities`, `app_role` enum, `user_roles` (separate table, security-definer `has_role()`)
- `profiles` (name, facility_id, auto-created on signup)
- `residents`, `resident_family`, `resident_staff`
- `invites`, `staff_requests`
- `posts`, `mood_logs`, `weekly_surveys`, `decline_alerts`
- Storage bucket `resident-photos` (public read, staff write)
- RLS: family read-only on linked residents, staff read/write on facility residents, admin full access on facility
- Trigger on `weekly_surveys` insert → check last 2 weeks per category → upsert `decline_alerts`

## Phase 3 — Landing/Login screen at `/`
Four cards:
1. **Log in** → `/auth/login` (email+password, role-routed redirect)
2. **Join as Staff** → `/auth/join-staff` (email + facility dropdown → inserts `staff_requests`)
3. **Join as Family** → `/auth/join-family?token=...` (validates invite token, signup + 2FA enrollment)
4. **Learn about dementia** → `/learn` (no auth)

Post-login routing via `user_roles`:
- admin → `/admin`
- staff → `/staff`
- family → `/resident`

## Phase 4 — Admin dashboard (`/admin`)
- Staff approval queue (list pending `staff_requests`, approve/deny)
- On approve: server fn creates invite + sends Supabase invite email (set-password link), assigns staff role
- Resident list for facility
- Facility settings (basic)

## Phase 5 — Staff dashboard (`/staff`)
- Resident list (facility-scoped) + "Create resident" form
- On resident create: auto-generate family invite link (copyable)
- Per resident: post photo (upload to storage + caption), log today's mood, weekly survey form

## Phase 6 — Family/Resident module (`/resident`)
- Resident selector (cards of linked residents)
- `/resident/$id` feed:
  - Profile header (name, photo, today's mood badge)
  - "I'm visiting today" button → Visit Mode overlay with 2-3 activity suggestions based on today's mood, linking into Learn articles; auto-dismisses after 3h (timestamp in localStorage)
  - 8-week line graph (Recharts) — Eating/Mood/Social/Mobility/Behaviors, tap legend to isolate
  - Decline alert banner (one per active alert, dismiss writes `dismissed_at`)
  - Photo feed (vertical scroll, read-only)
- AI Coach scoped to resident (passes resident context into existing coach prompt)

## Phase 7 — 2FA for family
Enroll TOTP (authenticator app) during family signup via `supabase.auth.mfa.enroll()`. SMS requires Twilio config — defer unless requested. Enforce on family login via AAL2 challenge.

---

## Technical Details

**Stack:** TanStack Start + Lovable Cloud (Supabase). Server functions for all DB writes/privileged reads. `requireSupabaseAuth` on protected fns + role checks via `has_role()`.

**Routing:**
- Public: `/`, `/learn/*`, `/auth/*`
- Protected under `_authenticated/`: `/admin`, `/staff`, `/resident/*`

**Invite tokens:** UUID `token` column on `invites`. Family signup validates token → creates `resident_family` link → marks invite used.

**Decline alert logic:** DB trigger after `weekly_surveys` insert; for each category in new row marked Declined (or Significant for behaviors), check the immediately prior week's survey for same resident — if also Declined, insert `decline_alerts` row (unique on resident_id+category where dismissed_at is null).

**Visit Mode suggestions:** Static content per mood tier, hardcoded in `src/lib/visit-mode.ts`, each item linking to existing Connect/Understand slugs.

**Graph:** Recharts LineChart, 5 lines, tap legend to toggle visibility.

---

## What I'd like to confirm before starting

1. **2FA method for family:** TOTP/authenticator app only (works out of the box), or do you want SMS too (requires Twilio account + secret — extra setup)?
2. **Facility seeding:** Should I seed 2-3 example facilities so the staff dropdown isn't empty for testing, or will you create facilities yourself in the admin UI?
3. **Phasing:** OK to ship in phases above (each phase is a working app), or do you want one giant change?

Once you confirm, I'll enable Lovable Cloud and start with Phase 1.