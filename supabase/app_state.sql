create table if not exists public.app_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.app_state enable row level security;

create policy "Allow public read app_state"
on public.app_state
for select
to anon, authenticated
using (true);

create policy "Allow public write app_state"
on public.app_state
for insert
to anon, authenticated
with check (true);

create policy "Allow public update app_state"
on public.app_state
for update
to anon, authenticated
using (true)
with check (true);
