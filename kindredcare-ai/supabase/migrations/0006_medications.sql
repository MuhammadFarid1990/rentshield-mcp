-- Medication schedules
create table public.medication_schedules (
  id                    uuid primary key default uuid_generate_v4(),
  senior_id             uuid not null references public.seniors(id) on delete cascade,
  created_by            uuid not null references public.users(id),
  med_name              text not null,
  dosage                text not null,
  dosage_unit           text,
  frequency             text not null, -- e.g. "twice daily", "every 8 hours"
  times                 time[] not null,
  instructions          text,
  start_date            date not null default current_date,
  end_date              date,
  is_active             boolean not null default true,
  refill_reminder_days  int not null default 7,
  notify_guardian       boolean not null default true,
  notify_center         boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create trigger med_schedules_updated_at before update on public.medication_schedules
  for each row execute function public.handle_updated_at();

-- Medication logs
create table public.medication_logs (
  id              uuid primary key default uuid_generate_v4(),
  senior_id       uuid not null references public.seniors(id) on delete cascade,
  schedule_id     uuid references public.medication_schedules(id) on delete set null,
  med_name        text not null,
  scheduled_time  timestamptz not null,
  taken_at        timestamptz,
  status          text not null default 'pending' check (status in ('taken','missed','skipped','pending')),
  confirmed_by    uuid references public.users(id),
  source          text not null default 'voice' check (source in ('voice','typed','staff','guardian','auto')),
  notes           text,
  created_at      timestamptz not null default now()
);

-- RLS
alter table public.medication_schedules enable row level security;
create policy "ms: senior read" on public.medication_schedules for select using (public.is_senior_self(senior_id));
create policy "ms: guardian all" on public.medication_schedules for all using (public.is_guardian_of(senior_id));
create policy "ms: staff all" on public.medication_schedules for all using (public.is_staff_of_senior(senior_id));
create policy "ms: admin" on public.medication_schedules for all using (public.is_admin());

alter table public.medication_logs enable row level security;
create policy "ml: senior all" on public.medication_logs for all using (public.is_senior_self(senior_id));
create policy "ml: guardian read" on public.medication_logs for select using (public.is_guardian_of(senior_id));
create policy "ml: staff read" on public.medication_logs for select using (public.is_staff_of_senior(senior_id));
create policy "ml: admin" on public.medication_logs for all using (public.is_admin());
