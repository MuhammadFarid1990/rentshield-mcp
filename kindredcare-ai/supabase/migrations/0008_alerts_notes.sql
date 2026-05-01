-- Risk alerts
create type alert_severity as enum ('low','medium','high','critical');
create type alert_status as enum ('open','acknowledged','resolved');

create table public.risk_alerts (
  id              uuid primary key default uuid_generate_v4(),
  senior_id       uuid not null references public.seniors(id) on delete cascade,
  triggered_by    uuid references public.users(id),
  severity        alert_severity not null default 'medium',
  status          alert_status not null default 'open',
  category        text not null, -- 'emergency','health','medication','wellness','loneliness'
  title           text not null,
  description     text,
  source          text not null default 'ai', -- 'ai','voice','manual','system'
  acknowledged_by uuid references public.users(id),
  acknowledged_at timestamptz,
  resolved_by     uuid references public.users(id),
  resolved_at     timestamptz,
  resolution_note text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger risk_alerts_updated_at before update on public.risk_alerts
  for each row execute function public.handle_updated_at();

-- Notes (staff/guardian notes on a senior)
create table public.notes (
  id          uuid primary key default uuid_generate_v4(),
  senior_id   uuid not null references public.seniors(id) on delete cascade,
  author_id   uuid not null references public.users(id),
  content     text not null,
  is_private  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger notes_updated_at before update on public.notes
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.risk_alerts enable row level security;
create policy "ra: senior read" on public.risk_alerts for select using (public.is_senior_self(senior_id));
create policy "ra: guardian all" on public.risk_alerts for all using (public.is_guardian_of(senior_id));
create policy "ra: staff all" on public.risk_alerts for all using (public.is_staff_of_senior(senior_id));
create policy "ra: admin all" on public.risk_alerts for all using (public.is_admin());

alter table public.notes enable row level security;
create policy "notes: author" on public.notes for all using (author_id = auth.uid());
create policy "notes: guardian read" on public.notes
  for select using (public.is_guardian_of(senior_id) and is_private = false);
create policy "notes: staff" on public.notes
  for all using (public.is_staff_of_senior(senior_id));
create policy "notes: admin" on public.notes for all using (public.is_admin());
