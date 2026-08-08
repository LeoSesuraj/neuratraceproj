-- Fixes: "Database error querying schema" on sign-in.
-- Cause: users inserted directly via SQL leave auth token columns NULL.
-- Auth (GoTrue) reads these as non-nullable strings and errors out.
-- Safe to run repeatedly.

UPDATE auth.users
SET
  confirmation_token     = COALESCE(confirmation_token, ''),
  recovery_token         = COALESCE(recovery_token, ''),
  email_change           = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change           = COALESCE(phone_change, ''),
  phone_change_token     = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  aud                    = COALESCE(NULLIF(aud, ''), 'authenticated'),
  role                   = COALESCE(NULLIF(role, ''), 'authenticated'),
  email_confirmed_at     = COALESCE(email_confirmed_at, now()),
  confirmation_sent_at   = COALESCE(confirmation_sent_at, now()),
  raw_app_meta_data      = COALESCE(raw_app_meta_data, '{"provider":"email","providers":["email"]}'::jsonb),
  raw_user_meta_data     = COALESCE(raw_user_meta_data, '{}'::jsonb),
  is_super_admin         = COALESCE(is_super_admin, false),
  created_at             = COALESCE(created_at, now()),
  updated_at             = COALESCE(updated_at, now());

-- Verify: every demo account should show blank (not null) tokens.
SELECT
  email,
  email_confirmed_at IS NOT NULL AS confirmed,
  confirmation_token IS NULL     AS bad_confirmation_token,
  recovery_token IS NULL         AS bad_recovery_token,
  email_change IS NULL           AS bad_email_change
FROM auth.users
ORDER BY email;
