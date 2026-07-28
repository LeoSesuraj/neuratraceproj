## Goal
Wipe all existing accounts and bootstrap a single super admin: `leonelbaskin@gmail.com` with a password you choose. Super admin can then onboard other users via the existing daily-key join flow shown in the admin dashboard.

## Steps

1. **Collect the password securely** via `add_secret` (name: `BOOTSTRAP_SUPERADMIN_PASSWORD`). You'll type it into a secure form — I never see it.

2. **Add a one-shot bootstrap server function** `bootstrapSuperAdmin` in `src/lib/admin.functions.ts`:
   - Guarded so it only runs while `BOOTSTRAP_SUPERADMIN_PASSWORD` is set (delete the secret after to disable).
   - Uses `supabaseAdmin` to:
     - Delete every user in `auth.users` (cascades to `profiles`, `user_roles`, `family_links`, messages, notifications, etc.).
     - Create `leonelbaskin@gmail.com` with the chosen password, `email_confirm: true`.
     - Insert a `user_roles` row with `role = 'super_admin'` for that user.
   - Returns `{ ok: true }` or the error.

3. **Invoke it once** via `invoke-server-function`, verify the account exists, then delete the `BOOTSTRAP_SUPERADMIN_PASSWORD` secret so the function is inert.

4. **Verify sign-in**: from `/` sign in as `leonelbaskin@gmail.com` → lands on `/admin/super`, where today's family/staff/admin join keys are already displayed. Share those keys with new users, who sign up via `/auth/join`.

## Notes
- This is irreversible — every existing account (super admins, admins, staff, family, residents' linked users) will be deleted.
- The super admin whitelist in `src/lib/super-admin.ts` already includes `leonelbaskin@gmail.com`, so the role check passes automatically.
- No new UI is needed; account creation for other users continues through the daily-key join flow already built into `/admin/super`.

Reply "go" to proceed and I'll open the secure password prompt.