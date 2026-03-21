-- Persist dashboard PATCH data (location, brief, amenities, etc.) across Vercel cold starts.
-- Run in Supabase → SQL Editor. Requires SUPABASE_SERVICE_ROLE_KEY in the app (already used for assets).

create table if not exists public.project_overrides (
  project_id text primary key,
  payload jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create index if not exists project_overrides_updated_at_idx on public.project_overrides (updated_at desc);
