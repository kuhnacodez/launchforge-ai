-- ============================================================
-- LaunchForge AI — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  subscription_tier text not null default 'free',
  generations_used integer not null default 0,
  generations_limit integer not null default 3,
  generations_reset_at timestamp with time zone default date_trunc('month', now()),
  stripe_customer_id text unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Allow service role to insert/update profiles (for triggers + API)
create policy "Service role full access to profiles" on public.profiles
  using (true) with check (true);

-- PROJECTS
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  prompt text not null,
  industry text not null,
  output jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.projects enable row level security;

create policy "Users can view own projects" on public.projects
  for select using (auth.uid() = user_id);

create policy "Users can insert own projects" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own projects" on public.projects
  for delete using (auth.uid() = user_id);

create policy "Users can update own projects" on public.projects
  for update using (auth.uid() = user_id);

-- INDEX for fast user-scoped queries
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_created_at_idx on public.projects(created_at desc);

-- AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- UPDATED_AT trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_projects_updated_at before update on public.projects
  for each row execute procedure public.set_updated_at();
