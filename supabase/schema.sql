-- ============================================================
-- CoverCraft Database Schema
-- Run this entire file in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → paste → Run)
-- ============================================================


-- ── profiles ────────────────────────────────────────────────
-- One row per user; created automatically via trigger on signup.

create table if not exists public.profiles (
  id                    uuid        primary key references auth.users(id) on delete cascade,
  email                 text        not null,
  plan                  text        not null default 'free'
                          check (plan in ('free', 'pro', 'job_seeker')),
  generations_used      integer     not null default 0,
  stripe_customer_id    text,
  stripe_subscription_id text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Enable Row-Level Security
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);


-- ── generations ─────────────────────────────────────────────
-- Stores every AI generation for Pro/Job Seeker history.

create table if not exists public.generations (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  tool        text        not null
                check (tool in ('cover_letter', 'linkedin_summary', 'recruiter_email')),
  input       jsonb       not null default '{}',
  output      text,
  created_at  timestamptz not null default now()
);

-- Enable Row-Level Security
alter table public.generations enable row level security;

-- Users can read their own generations
create policy "Users can view own generations"
  on public.generations for select
  using (auth.uid() = user_id);

-- Users can insert their own generations
create policy "Users can insert own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);


-- ── Trigger: auto-create profile on signup ──────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Drop and recreate to avoid duplicate trigger errors
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();


-- ── Trigger: auto-update updated_at on profiles ─────────────

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_profiles_updated_at on public.profiles;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute procedure public.update_updated_at_column();


-- ── Indexes ──────────────────────────────────────────────────

create index if not exists idx_generations_user_id
  on public.generations(user_id);

create index if not exists idx_generations_created_at
  on public.generations(created_at desc);
