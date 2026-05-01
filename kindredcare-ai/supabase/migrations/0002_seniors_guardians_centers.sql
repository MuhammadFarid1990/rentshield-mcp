-- Seniors
create table public.seniors (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid unique not null references public.users(id) on delete cascade,
  date_of_birth   date,
  age             int,
  preferred_name  text,
  primary_language text not null default 'en',
  secondary_language text,
  voice_speed     numeric(3,1) not null default 1.0 check (voice_speed between 0.5 and 2.0),
  response_style  text not null default 'friendly' check (response_style in ('friendly','formal','short','slow','calm')),
  mobility_notes  text,
  diet_notes      text,
  allergies       text,
  transportation_needs text,
  favorite_activities text[],
  wake_time       time,
  sleep_time      time,
  breakfast_time  time,
  lunch_time      time,
  dinner_time     time,
  wellness_checkin_preference text not null default 'morning' check (wellness_checkin_preference in ('morning','evening','both')),
  high_contrast   boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger seniors_updated_at before update on public.seniors
  for each row execute function public.handle_updated_at();

-- Guardians
create table public.guardians (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid unique not null references public.users(id) on delete cascade,
  relationship text,
  created_at timestamptz not null default now()
);

-- Care centers
create table public.care_centers (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  address      text,
  phone        text,
  email        text,
  website      text,
  logo_url     text,
  brand_color  text default '#1e40af',
  timezone     text not null default 'America/New_York',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger care_centers_updated_at before update on public.care_centers
  for each row execute function public.handle_updated_at();

-- Staff
create table public.staff (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid unique not null references public.users(id) on delete cascade,
  care_center_id  uuid not null references public.care_centers(id) on delete cascade,
  title           text,
  department      text,
  created_at      timestamptz not null default now()
);

-- Doctors
create table public.doctors (
  id              uuid primary key default uuid_generate_v4(),
  senior_id       uuid not null references public.seniors(id) on delete cascade,
  full_name       text not null,
  specialty       text,
  clinic_name     text,
  phone           text,
  office_hours    text,
  notes           text,
  is_primary      boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger doctors_updated_at before update on public.doctors
  for each row execute function public.handle_updated_at();

-- RLS helpers
create or replace function public.get_senior_id_for_user(p_user_id uuid)
returns uuid language sql stable security definer as $$
  select id from public.seniors where user_id = p_user_id limit 1;
$$;

create or replace function public.is_senior_self(p_senior_id uuid)
returns boolean language sql stable security definer as $$
  select exists (select 1 from public.seniors where id = p_senior_id and user_id = auth.uid());
$$;

create or replace function public.is_guardian_of(p_senior_id uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.senior_guardian_links
    where senior_id = p_senior_id
      and guardian_id = (select id from public.guardians where user_id = auth.uid())
  );
$$;

create or replace function public.is_staff_of_senior(p_senior_id uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.senior_center_links scl
    join public.staff s on s.care_center_id = scl.care_center_id
    where scl.senior_id = p_senior_id and s.user_id = auth.uid()
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

-- RLS on seniors
alter table public.seniors enable row level security;
create policy "seniors: self read/write" on public.seniors
  for all using (user_id = auth.uid());
create policy "seniors: guardian read" on public.seniors
  for select using (public.is_guardian_of(id));
create policy "seniors: staff read" on public.seniors
  for select using (public.is_staff_of_senior(id));
create policy "seniors: admin all" on public.seniors
  for all using (public.is_admin());

-- RLS on guardians
alter table public.guardians enable row level security;
create policy "guardians: self" on public.guardians for all using (user_id = auth.uid());
create policy "guardians: admin" on public.guardians for all using (public.is_admin());

-- RLS on care_centers
alter table public.care_centers enable row level security;
create policy "care_centers: staff read" on public.care_centers
  for select using (exists (select 1 from public.staff where care_center_id = id and user_id = auth.uid()));
create policy "care_centers: admin all" on public.care_centers
  for all using (public.is_admin());

-- RLS on staff
alter table public.staff enable row level security;
create policy "staff: self" on public.staff for select using (user_id = auth.uid());
create policy "staff: admin all" on public.staff for all using (public.is_admin());

-- RLS on doctors
alter table public.doctors enable row level security;
create policy "doctors: senior self" on public.doctors for all using (public.is_senior_self(senior_id));
create policy "doctors: guardian" on public.doctors for select using (public.is_guardian_of(senior_id));
create policy "doctors: staff" on public.doctors for select using (public.is_staff_of_senior(senior_id));
create policy "doctors: admin" on public.doctors for all using (public.is_admin());
