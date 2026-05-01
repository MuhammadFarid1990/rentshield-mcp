-- Care status (green/yellow/red per senior per day)
create type care_status_level as enum ('green','yellow','red');

create table public.daily_care_status (
  id                    uuid primary key default uuid_generate_v4(),
  senior_id             uuid not null references public.seniors(id) on delete cascade,
  status_date           date not null default current_date,
  overall_status        care_status_level not null default 'green',
  medicine_status       care_status_level not null default 'green',
  meal_status           care_status_level not null default 'green',
  hydration_status      care_status_level not null default 'green',
  mood_status           care_status_level not null default 'green',
  health_status         care_status_level not null default 'green',
  checkin_completed     boolean not null default false,
  missed_reminders_count int not null default 0,
  open_alerts_count      int not null default 0,
  notes                 text,
  computed_at           timestamptz not null default now(),
  unique (senior_id, status_date)
);

-- Weekly progress reports
create table public.weekly_progress_reports (
  id                     uuid primary key default uuid_generate_v4(),
  senior_id              uuid not null references public.seniors(id) on delete cascade,
  week_start             date not null,
  week_end               date not null,
  med_compliance_pct     numeric(5,2),
  missed_reminders_count int not null default 0,
  loneliness_logs_count  int not null default 0,
  bp_logs_count          int not null default 0,
  sugar_logs_count       int not null default 0,
  wellness_checkins_count int not null default 0,
  ai_summary             text,
  recommendations        jsonb,
  generated_at           timestamptz not null default now(),
  unique (senior_id, week_start)
);

-- Audit logs
create table public.audit_logs (
  id               uuid primary key default uuid_generate_v4(),
  actor_id         uuid references public.users(id) on delete set null,
  target_senior_id uuid references public.seniors(id) on delete set null,
  action           text not null,
  resource_type    text,
  resource_id      uuid,
  payload          jsonb,
  ip_address       inet,
  user_agent       text,
  created_at       timestamptz not null default now()
);

-- RLS
alter table public.daily_care_status enable row level security;
create policy "dcs: senior read" on public.daily_care_status for select using (public.is_senior_self(senior_id));
create policy "dcs: guardian read" on public.daily_care_status for select using (public.is_guardian_of(senior_id));
create policy "dcs: staff all" on public.daily_care_status for all using (public.is_staff_of_senior(senior_id));
create policy "dcs: admin all" on public.daily_care_status for all using (public.is_admin());

alter table public.weekly_progress_reports enable row level security;
create policy "wpr: senior read" on public.weekly_progress_reports for select using (public.is_senior_self(senior_id));
create policy "wpr: guardian read" on public.weekly_progress_reports for select using (public.is_guardian_of(senior_id));
create policy "wpr: staff read" on public.weekly_progress_reports for select using (public.is_staff_of_senior(senior_id));
create policy "wpr: admin all" on public.weekly_progress_reports for all using (public.is_admin());

alter table public.audit_logs enable row level security;
create policy "al: own" on public.audit_logs for select using (actor_id = auth.uid());
create policy "al: admin all" on public.audit_logs for all using (public.is_admin());
create policy "al: staff read own seniors" on public.audit_logs
  for select using (public.is_staff_of_senior(target_senior_id));
