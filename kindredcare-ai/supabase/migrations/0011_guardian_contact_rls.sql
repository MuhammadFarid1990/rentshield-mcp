-- 0011: Guardian write access for doctors + emergency contacts, and self-insert for audit_logs.
--
-- Earlier migrations only granted guardians SELECT on `doctors` and `emergency_contacts`,
-- which silently broke the new /guardian/contacts CRUD page (UPDATE/DELETE matched 0 rows
-- under RLS). Audit logs likewise had no INSERT policy for non-admins, so every
-- logAudit() call from a guardian/staff/senior was silently failing and the audit
-- trail was empty in production.

-- Doctors: guardian full access
create policy "doctors: guardian write" on public.doctors
  for insert with check (public.is_guardian_of(senior_id));
create policy "doctors: guardian update" on public.doctors
  for update using (public.is_guardian_of(senior_id));
create policy "doctors: guardian delete" on public.doctors
  for delete using (public.is_guardian_of(senior_id));

-- Doctors: staff full access (mirroring medication_schedules / calendar_events pattern)
create policy "doctors: staff write" on public.doctors
  for insert with check (public.is_staff_of_senior(senior_id));
create policy "doctors: staff update" on public.doctors
  for update using (public.is_staff_of_senior(senior_id));
create policy "doctors: staff delete" on public.doctors
  for delete using (public.is_staff_of_senior(senior_id));

-- Emergency contacts: guardian full access
create policy "ec: guardian write" on public.emergency_contacts
  for insert with check (public.is_guardian_of(senior_id));
create policy "ec: guardian update" on public.emergency_contacts
  for update using (public.is_guardian_of(senior_id));
create policy "ec: guardian delete" on public.emergency_contacts
  for delete using (public.is_guardian_of(senior_id));

-- Emergency contacts: staff full access
create policy "ec: staff write" on public.emergency_contacts
  for insert with check (public.is_staff_of_senior(senior_id));
create policy "ec: staff update" on public.emergency_contacts
  for update using (public.is_staff_of_senior(senior_id));
create policy "ec: staff delete" on public.emergency_contacts
  for delete using (public.is_staff_of_senior(senior_id));

-- Audit logs: any authenticated user may insert their own audit row.
-- Read policies (own + admin + staff) already exist in 0010.
create policy "al: insert own" on public.audit_logs
  for insert with check (actor_id = auth.uid());
