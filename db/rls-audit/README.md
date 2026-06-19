# RLS Audit

Two SQL files + an integration test suite that enforce and verify the
access-control model described in the project plan.

## Apply

The repo's `supabase/migrations/` directory is managed by the Lovable Cloud
migration tool, so these SQL files live outside it intentionally. Apply them
as two separate migrations (each `ALTER TYPE ... ADD VALUE` must be in its
own transaction):

1. **Part 1** — paste `01_add_super_admin_role.sql` into a new migration
   named `add_super_admin_role`. Run it.
2. **Part 2** — paste `02_audit_policies.sql` into a new migration named
   `rls_audit_policies`. Run it.

## What it does

- Adds the `super_admin` value to `app_role` and a SECURITY DEFINER
  `is_super_admin()` helper.
- Drops and recreates every policy on every public table with explicit
  super_admin overrides, owner-scoped reads, and a `COMMENT ON POLICY`
  explaining intent.
- Revokes the `anon` SELECT on `facilities` so the directory is only
  readable by signed-in users.
- `FORCE ROW LEVEL SECURITY` on every public table so policies still apply
  to the table owner. `service_role` keeps its `BYPASSRLS` privilege for
  admin server code.

## Access model (matches the seeded schema)

| Table | Read | Write |
|---|---|---|
| `profiles` | own row + super_admin | own row + super_admin |
| `user_roles` | own roles + facility admin (same facility) + super_admin | facility admin (staff/family only) + super_admin |
| `facilities` | any authenticated user | super_admin only |
| `residents` | family of resident, staff/admin in facility, super_admin | staff/admin in facility, super_admin |
| `resident_family` / `resident_staff` | facility staff/admin + the family member themselves + super_admin | facility staff/admin + super_admin |
| `posts` / `mood_logs` / `weekly_surveys` / `decline_alerts` | anyone who can view the resident | facility staff/admin + super_admin |
| `invites` | by token (read open), facility admin update, super_admin all | facility staff/admin create, facility admin update, super_admin all |
| `staff_requests` | facility admin (own facility) + super_admin | anyone insert; facility admin decide; super_admin all |

## Tests

`tests/rls.test.ts` is a Vitest integration suite that signs in as each
seeded role account and asserts allowed vs denied queries:

```bash
bunx vitest run tests/rls.test.ts
```

It requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from
`.env` and the seeded demo accounts. Tests cover anon, family, staff,
admin, and super_admin.
