-- Senior <-> Guardian links
create table public.senior_guardian_links (
  id           uuid primary key default uuid_generate_v4(),
  senior_id    uuid not null references public.seniors(id) on delete cascade,
  guardian_id  uuid not null references public.guardians(id) on delete cascade,
  relationship text,
  can_edit_calendar  boolean not null default true,
  can_edit_meds      boolean not null default true,
  can_view_health    boolean not null default true,
  receives_alerts    boolean not null default true,
  created_at   timestamptz not null default now(),
  unique (senior_id, guardian_id)
);

-- Senior <-> Care Center links
create table public.senior_center_links (
  id              uuid primary key default uuid_generate_v4(),
  senior_id       uuid not null references public.seniors(id) on delete cascade,
  care_center_id  uuid not null references public.care_centers(id) on delete cascade,
  enrolled_at     timestamptz not null default now(),
  status          text not null default 'active' check (status in ('active','inactive','pending')),
  consent_signed  boolean not null default false,
  consent_date    timestamptz,
  created_at      timestamptz not null default now(),
  unique (senior_id, care_center_id)
);

-- Care circle members (unified view of who can see a senior)
create table public.care_circle_members (
  id              uuid primary key default uuid_generate_v4(),
  senior_id       uuid not null references public.seniors(id) on delete cascade,
  member_user_id  uuid not null references public.users(id) on delete cascade,
  member_role     user_role not null,
  permissions     jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  unique (senior_id, member_user_id)
);

-- Emergency contacts
create table public.emergency_contacts (
  id           uuid primary key default uuid_generate_v4(),
  senior_id    uuid not null references public.seniors(id) on delete cascade,
  full_name    text not null,
  relationship text not null,
  phone        text not null,
  is_primary   boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

-- RLS
alter table public.senior_guardian_links enable row level security;
create policy "sgl: senior self" on public.senior_guardian_links for all using (public.is_senior_self(senior_id));
create policy "sgl: guardian self" on public.senior_guardian_links for select using (
  guardian_id = (select id from public.guardians where user_id = auth.uid())
);
create policy "sgl: admin" on public.senior_guardian_links for all using (public.is_admin());

alter table public.senior_center_links enable row level security;
create policy "scl: senior self" on public.senior_center_links for select using (public.is_senior_self(senior_id));
create policy "scl: staff" on public.senior_center_links for all using (
  exists (select 1 from public.staff where care_center_id = senior_center_links.care_center_id and user_id = auth.uid())
);
create policy "scl: admin" on public.senior_center_links for all using (public.is_admin());

alter table public.care_circle_members enable row level security;
create policy "ccm: senior self" on public.care_circle_members for select using (public.is_senior_self(senior_id));
create policy "ccm: member self" on public.care_circle_members for select using (member_user_id = auth.uid());
create policy "ccm: admin" on public.care_circle_members for all using (public.is_admin());

alter table public.emergency_contacts enable row level security;
create policy "ec: senior self" on public.emergency_contacts for all using (public.is_senior_self(senior_id));
create policy "ec: guardian" on public.emergency_contacts for select using (public.is_guardian_of(senior_id));
create policy "ec: staff" on public.emergency_contacts for select using (public.is_staff_of_senior(senior_id));
create policy "ec: admin" on public.emergency_contacts for all using (public.is_admin());
