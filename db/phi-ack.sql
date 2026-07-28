-- Non-PHI pilot acknowledgment log.
-- Applied via Lovable Cloud SQL editor. Records that a user has agreed not to
-- enter Protected Health Information into the app.

create table if not exists public.phi_acknowledgments (
  user_id uuid primary key references auth.users(id) on delete cascade,
  acknowledged_at timestamptz not null default now(),
  version text not null default 'v1'
);

grant select, insert, update on public.phi_acknowledgments to authenticated;
grant all on public.phi_acknowledgments to service_role;

alter table public.phi_acknowledgments enable row level security;

drop policy if exists "own ack read" on public.phi_acknowledgments;
create policy "own ack read"
  on public.phi_acknowledgments
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "own ack upsert" on public.phi_acknowledgments;
create policy "own ack upsert"
  on public.phi_acknowledgments
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "own ack update" on public.phi_acknowledgments;
create policy "own ack update"
  on public.phi_acknowledgments
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
