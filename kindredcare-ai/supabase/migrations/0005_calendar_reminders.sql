-- Calendar event type enum
create type calendar_event_type as enum (
  'medicine','bp_check','sugar_check','pulse_check','weight_check','temp_check',
  'meal','hydration','doctor_appointment','center_visit','transportation',
  'exercise','therapy','family_call','social_activity','custom'
);

-- Calendar events
create table public.calendar_events (
  id              uuid primary key default uuid_generate_v4(),
  senior_id       uuid not null references public.seniors(id) on delete cascade,
  created_by      uuid not null references public.users(id),
  event_type      calendar_event_type not null,
  title           text not null,
  description     text,
  scheduled_at    timestamptz not null,
  duration_minutes int not null default 15,
  location        text,
  voice_alert     boolean not null default true,
  voice_message   text,
  is_completed    boolean not null default false,
  completed_at    timestamptz,
  completed_by    uuid references public.users(id),
  is_cancelled    boolean not null default false,
  recurrence_rule_id uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger calendar_events_updated_at before update on public.calendar_events
  for each row execute function public.handle_updated_at();

-- Recurring calendar rules
create table public.recurring_calendar_rules (
  id              uuid primary key default uuid_generate_v4(),
  senior_id       uuid not null references public.seniors(id) on delete cascade,
  created_by      uuid not null references public.users(id),
  event_type      calendar_event_type not null,
  title           text not null,
  description     text,
  voice_message   text,
  rrule           text not null, -- iCal RRULE string e.g. FREQ=DAILY;BYHOUR=8
  duration_minutes int not null default 15,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger recurring_rules_updated_at before update on public.recurring_calendar_rules
  for each row execute function public.handle_updated_at();

-- Back-reference
alter table public.calendar_events
  add constraint fk_recurrence_rule
  foreign key (recurrence_rule_id) references public.recurring_calendar_rules(id) on delete set null;

-- Reminder templates (one-click presets)
create table public.reminder_templates (
  id              uuid primary key default uuid_generate_v4(),
  care_center_id  uuid references public.care_centers(id) on delete cascade,
  event_type      calendar_event_type not null,
  title           text not null,
  default_time    time,
  voice_message   text,
  is_system       boolean not null default false, -- true = built-in preset
  created_at      timestamptz not null default now()
);

-- Missed reminder alerts
create table public.missed_reminder_alerts (
  id              uuid primary key default uuid_generate_v4(),
  senior_id       uuid not null references public.seniors(id) on delete cascade,
  calendar_event_id uuid references public.calendar_events(id) on delete set null,
  event_type      calendar_event_type,
  title           text not null,
  scheduled_at    timestamptz not null,
  notified_guardian boolean not null default false,
  notified_staff    boolean not null default false,
  resolved        boolean not null default false,
  resolved_at     timestamptz,
  created_at      timestamptz not null default now()
);

-- RLS on calendar_events
alter table public.calendar_events enable row level security;
create policy "ce: senior read" on public.calendar_events for select using (public.is_senior_self(senior_id));
create policy "ce: guardian all" on public.calendar_events for all using (public.is_guardian_of(senior_id));
create policy "ce: staff all" on public.calendar_events for all using (public.is_staff_of_senior(senior_id));
create policy "ce: admin" on public.calendar_events for all using (public.is_admin());
create policy "ce: senior complete" on public.calendar_events
  for update using (public.is_senior_self(senior_id));

alter table public.recurring_calendar_rules enable row level security;
create policy "rcr: guardian all" on public.recurring_calendar_rules for all using (public.is_guardian_of(senior_id));
create policy "rcr: staff all" on public.recurring_calendar_rules for all using (public.is_staff_of_senior(senior_id));
create policy "rcr: senior read" on public.recurring_calendar_rules for select using (public.is_senior_self(senior_id));
create policy "rcr: admin" on public.recurring_calendar_rules for all using (public.is_admin());

alter table public.reminder_templates enable row level security;
create policy "rt: public read" on public.reminder_templates for select using (is_system = true);
create policy "rt: staff manage" on public.reminder_templates for all using (
  care_center_id is not null and
  exists (select 1 from public.staff where care_center_id = reminder_templates.care_center_id and user_id = auth.uid())
);
create policy "rt: admin" on public.reminder_templates for all using (public.is_admin());

alter table public.missed_reminder_alerts enable row level security;
create policy "mra: senior" on public.missed_reminder_alerts for select using (public.is_senior_self(senior_id));
create policy "mra: guardian" on public.missed_reminder_alerts for select using (public.is_guardian_of(senior_id));
create policy "mra: staff" on public.missed_reminder_alerts for all using (public.is_staff_of_senior(senior_id));
create policy "mra: admin" on public.missed_reminder_alerts for all using (public.is_admin());
