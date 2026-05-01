-- Performance indexes for all high-traffic queries

-- Users
create index idx_users_role on public.users(role);

-- Seniors
create index idx_seniors_user_id on public.seniors(user_id);

-- Links
create index idx_sgl_senior on public.senior_guardian_links(senior_id);
create index idx_sgl_guardian on public.senior_guardian_links(guardian_id);
create index idx_scl_senior on public.senior_center_links(senior_id);
create index idx_scl_center on public.senior_center_links(care_center_id);
create index idx_staff_center on public.staff(care_center_id);
create index idx_staff_user on public.staff(user_id);

-- Calendar
create index idx_calendar_senior_time on public.calendar_events(senior_id, scheduled_at);
create index idx_calendar_senior_completed on public.calendar_events(senior_id, is_completed);
create index idx_calendar_type on public.calendar_events(event_type);

-- Medications
create index idx_med_schedules_senior on public.medication_schedules(senior_id, is_active);
create index idx_med_logs_senior_time on public.medication_logs(senior_id, scheduled_time);
create index idx_med_logs_status on public.medication_logs(status);

-- Health records
create index idx_bp_senior_time on public.blood_pressure_records(senior_id, recorded_at);
create index idx_sugar_senior_time on public.blood_sugar_records(senior_id, recorded_at);
create index idx_health_senior_time on public.health_check_records(senior_id, recorded_at);
create index idx_wellness_senior_time on public.wellness_checkins(senior_id, checked_in_at);

-- Voice conversations
create index idx_voice_senior_time on public.voice_conversations(senior_id, created_at);

-- Alerts
create index idx_alerts_senior_status on public.risk_alerts(senior_id, status);
create index idx_alerts_severity on public.risk_alerts(severity);

-- Daily status
create index idx_dcs_senior_date on public.daily_care_status(senior_id, status_date);
create index idx_dcs_status on public.daily_care_status(overall_status);

-- Activities
create index idx_activities_center_time on public.center_activities(care_center_id, scheduled_at);
create index idx_invitations_activity on public.activity_invitations(activity_id);
create index idx_invitations_senior on public.activity_invitations(senior_id);

-- Transport & visits
create index idx_transport_senior on public.transportation_requests(senior_id, pickup_at);
create index idx_visits_senior on public.visit_requests(senior_id, requested_date);
create index idx_visits_center on public.visit_requests(care_center_id);

-- Audit logs
create index idx_audit_senior on public.audit_logs(target_senior_id, created_at);
create index idx_audit_actor on public.audit_logs(actor_id, created_at);

-- Missed reminder alerts
create index idx_mra_senior on public.missed_reminder_alerts(senior_id, created_at);

-- Weekly reports
create index idx_wpr_senior_week on public.weekly_progress_reports(senior_id, week_start);
