-- Senior preferences (extended profile from voice onboarding)
create table public.senior_preferences (
  id                     uuid primary key default uuid_generate_v4(),
  senior_id              uuid unique not null references public.seniors(id) on delete cascade,
  ai_response_style      text not null default 'friendly',
  ai_brand_name          text not null default 'KindredCare',
  bilingual_mode         boolean not null default false,
  daily_briefing_enabled boolean not null default true,
  daily_briefing_time    time not null default '08:00',
  weekly_report_day      int not null default 1 check (weekly_report_day between 0 and 6),
  guardian_alerts        boolean not null default true,
  center_alerts          boolean not null default true,
  safe_range_bp_systolic_min  int not null default 90,
  safe_range_bp_systolic_max  int not null default 140,
  safe_range_bp_diastolic_min int not null default 60,
  safe_range_bp_diastolic_max int not null default 90,
  safe_range_blood_sugar_min  numeric(5,1) not null default 70,
  safe_range_blood_sugar_max  numeric(5,1) not null default 180,
  safe_range_pulse_min        int not null default 50,
  safe_range_pulse_max        int not null default 100,
  safe_range_temp_min         numeric(4,1) not null default 97.0,
  safe_range_temp_max         numeric(4,1) not null default 99.5,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create trigger senior_preferences_updated_at before update on public.senior_preferences
  for each row execute function public.handle_updated_at();

-- Notification preferences
create table public.notification_preferences (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid unique not null references public.users(id) on delete cascade,
  email_alerts     boolean not null default true,
  sms_alerts       boolean not null default false,
  push_alerts      boolean not null default false,
  missed_med       boolean not null default true,
  health_out_range boolean not null default true,
  emergency        boolean not null default true,
  daily_summary    boolean not null default true,
  weekly_report    boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger notification_prefs_updated_at before update on public.notification_preferences
  for each row execute function public.handle_updated_at();

-- Family voice messages
create table public.family_voice_messages (
  id              uuid primary key default uuid_generate_v4(),
  senior_id       uuid not null references public.seniors(id) on delete cascade,
  sender_user_id  uuid not null references public.users(id) on delete cascade,
  message_text    text not null,
  audio_url       text,
  is_read         boolean not null default false,
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

-- RLS
alter table public.senior_preferences enable row level security;
create policy "sp: senior self" on public.senior_preferences for all using (public.is_senior_self(senior_id));
create policy "sp: guardian read" on public.senior_preferences for select using (public.is_guardian_of(senior_id));
create policy "sp: staff read" on public.senior_preferences for select using (public.is_staff_of_senior(senior_id));
create policy "sp: guardian write" on public.senior_preferences for update using (public.is_guardian_of(senior_id));
create policy "sp: staff write" on public.senior_preferences for update using (public.is_staff_of_senior(senior_id));
create policy "sp: admin" on public.senior_preferences for all using (public.is_admin());

alter table public.notification_preferences enable row level security;
create policy "np: own" on public.notification_preferences for all using (user_id = auth.uid());
create policy "np: admin" on public.notification_preferences for all using (public.is_admin());

alter table public.family_voice_messages enable row level security;
create policy "fvm: senior read" on public.family_voice_messages for select using (public.is_senior_self(senior_id));
create policy "fvm: sender write" on public.family_voice_messages for insert with check (sender_user_id = auth.uid());
create policy "fvm: guardian write" on public.family_voice_messages
  for insert with check (public.is_guardian_of(senior_id) and sender_user_id = auth.uid());
create policy "fvm: senior mark read" on public.family_voice_messages
  for update using (public.is_senior_self(senior_id));
create policy "fvm: admin" on public.family_voice_messages for all using (public.is_admin());
