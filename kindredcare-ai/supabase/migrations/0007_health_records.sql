-- Blood pressure
create table public.blood_pressure_records (
  id           uuid primary key default uuid_generate_v4(),
  senior_id    uuid not null references public.seniors(id) on delete cascade,
  systolic     int not null,
  diastolic    int not null,
  pulse        int,
  notes        text,
  recorded_at  timestamptz not null default now(),
  recorded_by  uuid not null references public.users(id),
  source       text not null default 'voice' check (source in ('voice','typed','staff','device')),
  out_of_range boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Blood sugar
create table public.blood_sugar_records (
  id            uuid primary key default uuid_generate_v4(),
  senior_id     uuid not null references public.seniors(id) on delete cascade,
  value         numeric(5,1) not null,
  unit          text not null default 'mg/dL',
  measurement_context text check (measurement_context in ('fasting','after_meal','before_meal','random')),
  notes         text,
  recorded_at   timestamptz not null default now(),
  recorded_by   uuid not null references public.users(id),
  source        text not null default 'voice',
  out_of_range  boolean not null default false,
  created_at    timestamptz not null default now()
);

-- General health check records (pulse, weight, temp, pain, sleep)
create table public.health_check_records (
  id              uuid primary key default uuid_generate_v4(),
  senior_id       uuid not null references public.seniors(id) on delete cascade,
  pulse           int,
  weight_lbs      numeric(5,1),
  temperature_f   numeric(4,1),
  pain_level      int check (pain_level between 0 and 10),
  notes           text,
  recorded_at     timestamptz not null default now(),
  recorded_by     uuid not null references public.users(id),
  source          text not null default 'voice',
  created_at      timestamptz not null default now()
);

-- Wellness check-ins
create table public.wellness_checkins (
  id               uuid primary key default uuid_generate_v4(),
  senior_id        uuid not null references public.seniors(id) on delete cascade,
  mood             text check (mood in ('great','good','okay','lonely','sad','anxious','unwell')),
  sleep_quality    text check (sleep_quality in ('great','good','fair','poor')),
  water_intake_oz  int,
  meals_eaten      int check (meals_eaten between 0 and 6),
  energy_level     text check (energy_level in ('high','medium','low')),
  notes            text,
  checked_in_at    timestamptz not null default now(),
  source           text not null default 'voice',
  created_at       timestamptz not null default now()
);

-- Voice conversations
create table public.voice_conversations (
  id              uuid primary key default uuid_generate_v4(),
  senior_id       uuid not null references public.seniors(id) on delete cascade,
  transcript      text not null,
  ai_reply        text not null,
  intent          text,
  action_taken    text,
  action_confirmed boolean not null default false,
  safety_flag     boolean not null default false,
  safety_reason   text,
  created_at      timestamptz not null default now()
);

-- Apply same guardian/staff read-only RLS pattern
do $$
declare tbl text;
begin
  foreach tbl in array array['blood_pressure_records','blood_sugar_records','health_check_records','wellness_checkins'] loop
    execute format('alter table public.%I enable row level security;', tbl);
    execute format('create policy "%s: senior all" on public.%I for all using (public.is_senior_self(senior_id));', tbl, tbl);
    execute format('create policy "%s: guardian read" on public.%I for select using (public.is_guardian_of(senior_id));', tbl, tbl);
    execute format('create policy "%s: staff read" on public.%I for select using (public.is_staff_of_senior(senior_id));', tbl, tbl);
    execute format('create policy "%s: admin all" on public.%I for all using (public.is_admin());', tbl, tbl);
  end loop;
end;
$$;

alter table public.voice_conversations enable row level security;
create policy "vc: senior self" on public.voice_conversations for all using (public.is_senior_self(senior_id));
create policy "vc: guardian read" on public.voice_conversations for select using (public.is_guardian_of(senior_id));
create policy "vc: staff read" on public.voice_conversations for select using (public.is_staff_of_senior(senior_id));
create policy "vc: admin" on public.voice_conversations for all using (public.is_admin());
