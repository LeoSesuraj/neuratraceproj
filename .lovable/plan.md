# NeuraTrace: Full App Summary (for sharing with ChatGPT)

No code changes. This is a copy-ready description of the app.

## What it is
NeuraTrace is a mobile-first care coordination and education platform for dementia care. It connects memory care facilities (admins and staff) with residents' families in one shared, transparent space, replacing scattered texts, calls and paper notes. It is built as a non-PHI pilot: residents use pseudonyms (e.g. "Margaret B.") and the app actively blocks sensitive identifiers.

Contact: neuratraceadmin@gmail.com

## Who uses it (roles)
- **Super Admin**: creates nursing homes (facilities), generates signup keys, sees every facility, its paired admin emails, and full staff list.
- **Facility Admin**: manages one facility: active users, access logs, residents (add, edit, delete, reactivate), unlocks locked-out accounts, and shows a daily staff join key (resets at midnight UTC).
- **Staff**: see every resident in their facility (same shared view for all staff), post daily notes, mood logs, photos, surveys, and message families.
- **Family**: linked to their loved one through a resident-specific key; see updates, trends, and message the care team.

## Public website
- **Homepage**: premium editorial design (warm off-white, deep navy, teal), interactive brain explorer, situation previews, scroll reveals.
- **Learn hub** (`/learn`):
  - Understand: topics on dementia types and the brain.
  - Connect: practical guides for common situations (e.g. agitation, sundowning), mapped to resident behaviors.
  - Support: caregiver resources.
  - Journey: stage-by-stage tabs of the dementia journey.
  - AI Coach: currently shown as "coming soon".
- **Legal**: Terms and Privacy pages, linked in footer and sign-in.

## Sign-in and accounts
- Email and password login (no email verification), 12-character minimum passwords.
- Join with a key (`/auth/join`): staff key or family resident key.
- Password reset and set-password flows.
- Server-side failed-login lockout that admins can clear remotely.
- Safety (non-PHI) acknowledgment shown at every login.

## Resident profile (core of the app)
- Photo (staff/admin can upload, replace, remove), dementia type, behavior checklist.
- **Activity tab**: daily notes, mood logs, photo posts, AI Insights placeholder card.
- **Trends**: survey charts with Today / 6 weeks / 12 weeks / All toggles.
- **Learn tab**: guides matched to the resident's selected behaviors, opened in a slide-over panel.
- **Messages**: real-time family-to-staff chat thread per resident (bubbles, day separators, avatars). Family gets a floating message button with a red unread dot.

## Notifications
- Bell icon with unread badge in the header.
- Database trigger notifies family when staff message, and staff when family message (admins excluded).
- Notifications page with back button.

## Safety and privacy guardrails
- Blocks SSNs, dates of birth and similar patterns in text inputs (client and server).
- Pseudonym enforcement for residents, persistent pilot warnings.

## Platform and tech
- React (TanStack Start), Lovable Cloud backend (database, auth, realtime, storage).
- Sentry error tracking, `/api/health` endpoint, startup environment checks.
- Deployed on Vercel with a strict security header policy; native iOS and Android wrappers via Capacitor.
- Fully mobile-optimized (safe areas, iOS keyboard handling, 16px minimum text).

## Demo setup
- Demo accounts: superadmin@, admin@, staff@, family@neuratrace.demo (shared demo password).
- Demo facility: Sunrise Memory Care Center with resident Margaret B. and 12 weeks of seeded data.
- Family demo key: NTFAMILY1.

## In progress
- Rolling the new editorial design from the homepage across the remaining Learn pages.
- Immersive lesson player and live AI Coach.
