-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Role enum
create type user_role as enum ('senior', 'guardian', 'staff', 'admin');

-- Public users table mirrors auth.users
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique not null,
  full_name    text not null,
  role         user_role not null default 'senior',
  avatar_url   text,
  phone        text,
  timezone     text not null default 'America/New_York',
  locale       text not null default 'en',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger users_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

-- Trigger: create public.users row on auth signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'senior')
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.users enable row level security;
create policy "users: read own" on public.users for select using (auth.uid() = id);
create policy "users: update own" on public.users for update using (auth.uid() = id);
create policy "admins: full access to users" on public.users for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
