-- Run in Lovable Cloud > SQL editor.
-- Adds a behaviors text[] column to residents so staff/admin can flag
-- current behaviors (repeating questions, sundowning, etc.). The values
-- are short string ids defined on the frontend (src/lib/behaviors.ts);
-- the column is intentionally untyped at the DB level so new behavior
-- options can be added without a migration.

ALTER TABLE public.residents
  ADD COLUMN IF NOT EXISTS behaviors TEXT[] NOT NULL DEFAULT '{}';

-- Existing rows keep the default empty array. No backfill needed.

-- RLS unchanged: existing residents policies already gate read/write to
-- the staff/admin/family of the resident's facility. The column inherits
-- those policies.
