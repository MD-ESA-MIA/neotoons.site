-- Portable, migration-friendly schema for Supabase/Postgres.
-- Uses flat records and JSON-friendly fields to simplify Firebase migration.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin', 'owner')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plan_id text not null,
  status text not null check (status in ('active', 'canceled', 'past_due', 'trialing')),
  started_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_messages_email on public.messages(email);
create index if not exists idx_messages_user_id on public.messages(user_id);
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute procedure public.set_updated_at();

drop trigger if exists messages_set_updated_at on public.messages;
create trigger messages_set_updated_at
before update on public.messages
for each row execute procedure public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute procedure public.set_updated_at();

-- Optional starter policies (tighten according to your auth requirements)
alter table public.users enable row level security;
alter table public.messages enable row level security;
alter table public.subscriptions enable row level security;

-- Basic development policies (replace in production)
drop policy if exists "dev users all" on public.users;
create policy "dev users all" on public.users for all using (true) with check (true);

drop policy if exists "dev messages all" on public.messages;
create policy "dev messages all" on public.messages for all using (true) with check (true);

drop policy if exists "dev subscriptions all" on public.subscriptions;
create policy "dev subscriptions all" on public.subscriptions for all using (true) with check (true);
