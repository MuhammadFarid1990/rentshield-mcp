-- Center activities
create table public.center_activities (
  id              uuid primary key default uuid_generate_v4(),
  care_center_id  uuid not null references public.care_centers(id) on delete cascade,
  created_by      uuid not null references public.users(id),
  title           text not null,
  activity_type   text not null, -- 'lunch','exercise','music','bingo','walking','memory','birthday','family_visit','prayer','education','custom'
  description     text,
  scheduled_at    timestamptz not null,
  duration_minutes int not null default 60,
  max_participants int,
  location        text,
  transportation_provided boolean not null default false,
  tags            text[],
  is_cancelled    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger activities_updated_at before update on public.center_activities
  for each row execute function public.handle_updated_at();

-- Activity invitations
create table public.activity_invitations (
  id              uuid primary key default uuid_generate_v4(),
  activity_id     uuid not null references public.center_activities(id) on delete cascade,
  senior_id       uuid not null references public.seniors(id) on delete cascade,
  invited_by      uuid references public.users(id),
  status          text not null default 'invited' check (status in ('invited','accepted','declined','attended','no_show')),
  ai_recommended  boolean not null default false,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (activity_id, senior_id)
);
create trigger invitations_updated_at before update on public.activity_invitations
  for each row execute function public.handle_updated_at();

-- Transportation requests
create table public.transportation_requests (
  id              uuid primary key default uuid_generate_v4(),
  senior_id       uuid not null references public.seniors(id) on delete cascade,
  requested_by    uuid not null references public.users(id),
  pickup_address  text,
  dropoff_address text,
  pickup_at       timestamptz not null,
  purpose         text,
  status          text not null default 'pending' check (status in ('pending','confirmed','en_route','completed','cancelled')),
  assigned_to     uuid references public.users(id),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger transport_updated_at before update on public.transportation_requests
  for each row execute function public.handle_updated_at();

-- Visit requests (senior wants to visit center)
create table public.visit_requests (
  id              uuid primary key default uuid_generate_v4(),
  senior_id       uuid not null references public.seniors(id) on delete cascade,
  care_center_id  uuid not null references public.care_centers(id) on delete cascade,
  requested_by    uuid not null references public.users(id),
  requested_date  date not null,
  preferred_time  time,
  reason          text,
  status          text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  confirmed_by    uuid references public.users(id),
  confirmed_at    timestamptz,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger visits_updated_at before update on public.visit_requests
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.center_activities enable row level security;
create policy "ca: staff all" on public.center_activities for all using (
  exists (select 1 from public.staff where care_center_id = center_activities.care_center_id and user_id = auth.uid())
);
create policy "ca: senior/guardian read" on public.center_activities for select using (
  public.is_senior_self(
    (select senior_id from public.activity_invitations where activity_id = center_activities.id limit 1)
  ) or
  public.is_guardian_of(
    (select senior_id from public.activity_invitations where activity_id = center_activities.id limit 1)
  )
);
create policy "ca: admin" on public.center_activities for all using (public.is_admin());

alter table public.activity_invitations enable row level security;
create policy "ai: senior" on public.activity_invitations for select using (public.is_senior_self(senior_id));
create policy "ai: guardian" on public.activity_invitations for select using (public.is_guardian_of(senior_id));
create policy "ai: staff" on public.activity_invitations for all using (public.is_staff_of_senior(senior_id));
create policy "ai: admin" on public.activity_invitations for all using (public.is_admin());

alter table public.transportation_requests enable row level security;
create policy "tr: senior" on public.transportation_requests for select using (public.is_senior_self(senior_id));
create policy "tr: guardian" on public.transportation_requests for all using (public.is_guardian_of(senior_id));
create policy "tr: staff" on public.transportation_requests for all using (public.is_staff_of_senior(senior_id));
create policy "tr: admin" on public.transportation_requests for all using (public.is_admin());

alter table public.visit_requests enable row level security;
create policy "vr: senior" on public.visit_requests for all using (public.is_senior_self(senior_id));
create policy "vr: guardian" on public.visit_requests for all using (public.is_guardian_of(senior_id));
create policy "vr: staff" on public.visit_requests for all using (public.is_staff_of_senior(senior_id));
create policy "vr: admin" on public.visit_requests for all using (public.is_admin());
