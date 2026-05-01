-- =====================================================================
-- KindredCare AI — Demo Seed Data
-- =====================================================================
-- Run AFTER all migrations have applied. Idempotent — safe to re-run.
-- Creates 1 care center, 2 seniors, 2 guardians, 1 staff, and a full
-- week of realistic activity so every screen has something to show.
--
-- Demo logins (password = demo1234 for all):
--   eleanor@kindredcare.demo  — senior
--   robert@kindredcare.demo   — senior
--   margaret@kindredcare.demo — guardian (Eleanor's daughter)
--   david@kindredcare.demo    — guardian (Robert's son)
--   sarah@kindredcare.demo    — staff (nurse at Sunny Acres)
-- =====================================================================

-- ---------- Care Center ----------------------------------------------
insert into public.care_centers (id, name, address, phone, email, brand_color, timezone)
values (
  '10000000-0000-0000-0000-000000000001',
  'Sunny Acres Senior Center',
  '123 Main St, Anytown, USA',
  '555-0100',
  'info@sunnyacres.example.com',
  '#0d9488',
  'America/New_York'
)
on conflict (id) do nothing;

-- ---------- Reminder template presets --------------------------------
insert into public.reminder_templates (event_type, title, default_time, voice_message, is_system) values
  ('medicine',  'Morning Medicine', '08:00', 'Time for your morning medicine.', true),
  ('medicine',  'Evening Medicine', '20:00', 'Time for your evening medicine.', true),
  ('hydration', 'Drink Water',      '10:00', 'Please drink a glass of water.',   true),
  ('meal',      'Breakfast',        '08:00', 'Time for breakfast.',              true),
  ('meal',      'Lunch',            '12:00', 'Time for lunch.',                  true),
  ('meal',      'Dinner',           '18:00', 'Time for dinner.',                 true),
  ('exercise',  'Short Walk',       '09:00', 'Time for a short walk.',           true)
on conflict do nothing;

-- ---------- Auth users (triggers public.users insert) ----------------
-- Eleanor Hayes — senior
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0001-000000000001',
  'authenticated', 'authenticated',
  'eleanor@kindredcare.demo',
  crypt('demo1234', gen_salt('bf')),
  now(),
  jsonb_build_object('full_name', 'Eleanor Hayes', 'role', 'senior'),
  now() - interval '60 days', now()
) on conflict (id) do nothing;

-- Robert Chen — senior
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0001-000000000002',
  'authenticated', 'authenticated',
  'robert@kindredcare.demo',
  crypt('demo1234', gen_salt('bf')),
  now(),
  jsonb_build_object('full_name', 'Robert Chen', 'role', 'senior'),
  now() - interval '45 days', now()
) on conflict (id) do nothing;

-- Margaret Hayes — guardian (Eleanor's daughter)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0002-000000000001',
  'authenticated', 'authenticated',
  'margaret@kindredcare.demo',
  crypt('demo1234', gen_salt('bf')),
  now(),
  jsonb_build_object('full_name', 'Margaret Hayes', 'role', 'guardian'),
  now() - interval '60 days', now()
) on conflict (id) do nothing;

-- David Chen — guardian (Robert's son)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0002-000000000002',
  'authenticated', 'authenticated',
  'david@kindredcare.demo',
  crypt('demo1234', gen_salt('bf')),
  now(),
  jsonb_build_object('full_name', 'David Chen', 'role', 'guardian'),
  now() - interval '45 days', now()
) on conflict (id) do nothing;

-- Sarah Mitchell — staff
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0003-000000000001',
  'authenticated', 'authenticated',
  'sarah@kindredcare.demo',
  crypt('demo1234', gen_salt('bf')),
  now(),
  jsonb_build_object('full_name', 'Sarah Mitchell, RN', 'role', 'staff'),
  now() - interval '90 days', now()
) on conflict (id) do nothing;

-- Some Supabase trigger setups don't honor the role from metadata; force-update.
update public.users set role = 'senior'   where id = '20000000-0000-0000-0001-000000000001';
update public.users set role = 'senior'   where id = '20000000-0000-0000-0001-000000000002';
update public.users set role = 'guardian' where id = '20000000-0000-0000-0002-000000000001';
update public.users set role = 'guardian' where id = '20000000-0000-0000-0002-000000000002';
update public.users set role = 'staff'    where id = '20000000-0000-0000-0003-000000000001';

update public.users set phone = '555-0201' where id = '20000000-0000-0000-0001-000000000001';
update public.users set phone = '555-0202' where id = '20000000-0000-0000-0001-000000000002';
update public.users set phone = '555-0301' where id = '20000000-0000-0000-0002-000000000001';
update public.users set phone = '555-0302' where id = '20000000-0000-0000-0002-000000000002';
update public.users set phone = '555-0401' where id = '20000000-0000-0000-0003-000000000001';

-- ---------- Senior profiles ------------------------------------------
insert into public.seniors (
  id, user_id, date_of_birth, age, preferred_name,
  primary_language, voice_speed, response_style,
  mobility_notes, diet_notes, allergies, transportation_needs,
  favorite_activities, wake_time, sleep_time,
  breakfast_time, lunch_time, dinner_time,
  wellness_checkin_preference, high_contrast
) values (
  '30000000-0000-0000-0001-000000000001',
  '20000000-0000-0000-0001-000000000001',
  '1947-04-12', 78, 'Eleanor',
  'en', 0.95, 'friendly',
  'Uses a cane. Avoid stairs.',
  'Low sodium. Lactose intolerant.',
  'Penicillin, shellfish',
  'Needs ride for doctor visits',
  array['gardening','reading','classical music','knitting'],
  '06:30', '21:30', '08:00', '12:00', '18:00',
  'morning', false
) on conflict (id) do nothing;

insert into public.seniors (
  id, user_id, date_of_birth, age, preferred_name,
  primary_language, voice_speed, response_style,
  mobility_notes, diet_notes, allergies,
  favorite_activities, wake_time, sleep_time,
  breakfast_time, lunch_time, dinner_time,
  wellness_checkin_preference, high_contrast
) values (
  '30000000-0000-0000-0001-000000000002',
  '20000000-0000-0000-0001-000000000002',
  '1943-09-23', 82, 'Robert',
  'en', 0.9, 'calm',
  'Walks slowly. Uses walker outside.',
  'Diabetic — low sugar diet',
  'None known',
  array['chess','jazz music','documentaries','walking'],
  '07:00', '22:00', '08:30', '12:30', '18:30',
  'evening', true
) on conflict (id) do nothing;

-- ---------- Senior preferences ---------------------------------------
insert into public.senior_preferences (
  senior_id, ai_response_style, ai_brand_name,
  daily_briefing_enabled, daily_briefing_time
) values
  ('30000000-0000-0000-0001-000000000001', 'friendly', 'KindredCare', true, '08:00'),
  ('30000000-0000-0000-0001-000000000002', 'calm',     'KindredCare', true, '08:30')
on conflict (senior_id) do nothing;

-- ---------- Guardians -------------------------------------------------
insert into public.guardians (id, user_id, relationship) values
  ('40000000-0000-0000-0001-000000000001', '20000000-0000-0000-0002-000000000001', 'daughter'),
  ('40000000-0000-0000-0001-000000000002', '20000000-0000-0000-0002-000000000002', 'son')
on conflict (id) do nothing;

-- ---------- Staff -----------------------------------------------------
insert into public.staff (id, user_id, care_center_id, title, department) values
  ('50000000-0000-0000-0001-000000000001',
   '20000000-0000-0000-0003-000000000001',
   '10000000-0000-0000-0000-000000000001',
   'Registered Nurse', 'Wellness')
on conflict (id) do nothing;

-- ---------- Links: senior <-> guardian -------------------------------
insert into public.senior_guardian_links (senior_id, guardian_id, relationship) values
  ('30000000-0000-0000-0001-000000000001', '40000000-0000-0000-0001-000000000001', 'daughter'),
  ('30000000-0000-0000-0001-000000000002', '40000000-0000-0000-0001-000000000002', 'son')
on conflict (senior_id, guardian_id) do nothing;

-- ---------- Links: senior <-> care center ----------------------------
insert into public.senior_center_links (senior_id, care_center_id, status, consent_signed, consent_date) values
  ('30000000-0000-0000-0001-000000000001', '10000000-0000-0000-0000-000000000001', 'active', true, now() - interval '60 days'),
  ('30000000-0000-0000-0001-000000000002', '10000000-0000-0000-0000-000000000001', 'active', true, now() - interval '45 days')
on conflict (senior_id, care_center_id) do nothing;

-- ---------- Doctors ---------------------------------------------------
insert into public.doctors (senior_id, full_name, specialty, clinic_name, phone, is_primary) values
  ('30000000-0000-0000-0001-000000000001', 'Linda Park, MD',  'Internal Medicine', 'Park Family Clinic',   '555-0501', true),
  ('30000000-0000-0000-0001-000000000001', 'Marcus Webb, MD', 'Cardiology',        'Heartwell Cardiology', '555-0502', false),
  ('30000000-0000-0000-0001-000000000002', 'Susan Lee, MD',   'Endocrinology',     'Lee Diabetes Center',  '555-0503', true),
  ('30000000-0000-0000-0001-000000000002', 'James Ortiz, MD', 'Geriatrics',        'Ortiz Senior Health',  '555-0504', false)
on conflict do nothing;

-- ---------- Emergency contacts ---------------------------------------
insert into public.emergency_contacts (senior_id, full_name, relationship, phone, is_primary, sort_order) values
  ('30000000-0000-0000-0001-000000000001', 'Margaret Hayes',   'Daughter', '555-0301', true,  0),
  ('30000000-0000-0000-0001-000000000001', 'Thomas Hayes',     'Son',      '555-0303', false, 1),
  ('30000000-0000-0000-0001-000000000001', 'Sunny Acres Front Desk', 'Care Center', '555-0100', false, 2),
  ('30000000-0000-0000-0001-000000000002', 'David Chen',       'Son',      '555-0302', true,  0),
  ('30000000-0000-0000-0001-000000000002', 'Helen Chen',       'Daughter', '555-0304', false, 1),
  ('30000000-0000-0000-0001-000000000002', 'Sunny Acres Front Desk', 'Care Center', '555-0100', false, 2)
on conflict do nothing;

-- ---------- Medication schedules -------------------------------------
insert into public.medication_schedules (
  id, senior_id, created_by, med_name, dosage, frequency, times,
  instructions, is_active, notify_guardian
) values
  ('60000000-0000-0000-0001-000000000001',
   '30000000-0000-0000-0001-000000000001',
   '20000000-0000-0000-0002-000000000001',
   'Lisinopril', '10mg', 'once daily', array['08:00'::time],
   'Take with breakfast.', true, true),
  ('60000000-0000-0000-0001-000000000002',
   '30000000-0000-0000-0001-000000000001',
   '20000000-0000-0000-0002-000000000001',
   'Atorvastatin', '20mg', 'once daily at night', array['20:00'::time],
   'Take after dinner.', true, true),
  ('60000000-0000-0000-0001-000000000003',
   '30000000-0000-0000-0001-000000000001',
   '20000000-0000-0000-0002-000000000001',
   'Vitamin D', '1000 IU', 'once daily', array['08:00'::time],
   '', true, false),
  ('60000000-0000-0000-0001-000000000004',
   '30000000-0000-0000-0001-000000000002',
   '20000000-0000-0000-0002-000000000002',
   'Metformin', '500mg', 'twice daily', array['08:00'::time, '20:00'::time],
   'Take with food.', true, true),
  ('60000000-0000-0000-0001-000000000005',
   '30000000-0000-0000-0001-000000000002',
   '20000000-0000-0000-0002-000000000002',
   'Aspirin', '81mg', 'once daily', array['08:00'::time],
   'Heart health.', true, true)
on conflict (id) do nothing;

-- ---------- Today's medication logs ----------------------------------
insert into public.medication_logs (senior_id, schedule_id, med_name, scheduled_time, taken_at, status, source) values
  ('30000000-0000-0000-0001-000000000001', '60000000-0000-0000-0001-000000000001',
   'Lisinopril',  date_trunc('day', now()) + interval '8 hours',
   date_trunc('day', now()) + interval '8 hours' + interval '5 minutes', 'taken', 'voice'),
  ('30000000-0000-0000-0001-000000000001', '60000000-0000-0000-0001-000000000003',
   'Vitamin D',   date_trunc('day', now()) + interval '8 hours',
   date_trunc('day', now()) + interval '8 hours' + interval '5 minutes', 'taken', 'voice'),
  ('30000000-0000-0000-0001-000000000001', '60000000-0000-0000-0001-000000000002',
   'Atorvastatin', date_trunc('day', now()) + interval '20 hours', null, 'pending', 'auto'),
  ('30000000-0000-0000-0001-000000000002', '60000000-0000-0000-0001-000000000004',
   'Metformin',   date_trunc('day', now()) + interval '8 hours',
   date_trunc('day', now()) + interval '8 hours' + interval '15 minutes', 'taken', 'staff'),
  ('30000000-0000-0000-0001-000000000002', '60000000-0000-0000-0001-000000000005',
   'Aspirin',     date_trunc('day', now()) + interval '8 hours', null, 'missed', 'auto'),
  ('30000000-0000-0000-0001-000000000002', '60000000-0000-0000-0001-000000000004',
   'Metformin',   date_trunc('day', now()) + interval '20 hours', null, 'pending', 'auto')
on conflict do nothing;

-- ---------- Today's calendar events ----------------------------------
insert into public.calendar_events (senior_id, created_by, event_type, title, scheduled_at, duration_minutes, voice_alert, is_completed) values
  ('30000000-0000-0000-0001-000000000001', '20000000-0000-0000-0002-000000000001',
   'meal', 'Breakfast',     date_trunc('day', now()) + interval '8 hours',  30, true, true),
  ('30000000-0000-0000-0001-000000000001', '20000000-0000-0000-0002-000000000001',
   'hydration', 'Drink Water', date_trunc('day', now()) + interval '10 hours', 5, true, true),
  ('30000000-0000-0000-0001-000000000001', '20000000-0000-0000-0002-000000000001',
   'meal', 'Lunch',         date_trunc('day', now()) + interval '12 hours', 45, true, false),
  ('30000000-0000-0000-0001-000000000001', '20000000-0000-0000-0002-000000000001',
   'doctor_appointment', 'Cardiology — Dr. Webb',
   date_trunc('day', now()) + interval '14 hours', 60, true, false),
  ('30000000-0000-0000-0001-000000000001', '20000000-0000-0000-0002-000000000001',
   'meal', 'Dinner',        date_trunc('day', now()) + interval '18 hours', 30, true, false),
  ('30000000-0000-0000-0001-000000000002', '20000000-0000-0000-0002-000000000002',
   'meal', 'Breakfast',     date_trunc('day', now()) + interval '8 hours 30 minutes', 30, true, true),
  ('30000000-0000-0000-0001-000000000002', '20000000-0000-0000-0002-000000000002',
   'sugar_check', 'Blood sugar check', date_trunc('day', now()) + interval '12 hours', 5, true, false),
  ('30000000-0000-0000-0001-000000000002', '20000000-0000-0000-0002-000000000002',
   'center_visit', 'Senior Center — bingo',
   date_trunc('day', now()) + interval '14 hours', 90, true, false),
  ('30000000-0000-0000-0001-000000000002', '20000000-0000-0000-0002-000000000002',
   'meal', 'Dinner',        date_trunc('day', now()) + interval '18 hours 30 minutes', 30, true, false)
on conflict do nothing;

-- ---------- Blood pressure (last 7 days) -----------------------------
insert into public.blood_pressure_records (senior_id, systolic, diastolic, pulse, recorded_at, recorded_by, source, out_of_range) values
  ('30000000-0000-0000-0001-000000000001', 132, 84, 72, now() - interval '6 days',  '20000000-0000-0000-0001-000000000001', 'voice', false),
  ('30000000-0000-0000-0001-000000000001', 138, 88, 74, now() - interval '5 days',  '20000000-0000-0000-0001-000000000001', 'voice', false),
  ('30000000-0000-0000-0001-000000000001', 145, 92, 78, now() - interval '4 days',  '20000000-0000-0000-0001-000000000001', 'voice', true),
  ('30000000-0000-0000-0001-000000000001', 134, 86, 71, now() - interval '3 days',  '20000000-0000-0000-0001-000000000001', 'voice', false),
  ('30000000-0000-0000-0001-000000000001', 130, 82, 70, now() - interval '2 days',  '20000000-0000-0000-0001-000000000001', 'voice', false),
  ('30000000-0000-0000-0001-000000000001', 128, 80, 69, now() - interval '1 day',   '20000000-0000-0000-0001-000000000001', 'voice', false),
  ('30000000-0000-0000-0001-000000000001', 135, 85, 72, now() - interval '4 hours', '20000000-0000-0000-0001-000000000001', 'voice', false),
  ('30000000-0000-0000-0001-000000000002', 142, 88, 75, now() - interval '5 days', '20000000-0000-0000-0001-000000000002', 'voice', true),
  ('30000000-0000-0000-0001-000000000002', 138, 86, 73, now() - interval '3 days', '20000000-0000-0000-0001-000000000002', 'voice', false),
  ('30000000-0000-0000-0001-000000000002', 140, 87, 74, now() - interval '6 hours', '20000000-0000-0000-0001-000000000002', 'voice', false)
on conflict do nothing;

-- ---------- Blood sugar (Robert is diabetic) -------------------------
insert into public.blood_sugar_records (senior_id, value, unit, measurement_context, recorded_at, recorded_by, source, out_of_range) values
  ('30000000-0000-0000-0001-000000000002', 145, 'mg/dL', 'fasting',     now() - interval '6 days', '20000000-0000-0000-0001-000000000002', 'voice', false),
  ('30000000-0000-0000-0001-000000000002', 162, 'mg/dL', 'after_meal',  now() - interval '5 days', '20000000-0000-0000-0001-000000000002', 'voice', false),
  ('30000000-0000-0000-0001-000000000002', 195, 'mg/dL', 'after_meal',  now() - interval '4 days', '20000000-0000-0000-0001-000000000002', 'voice', true),
  ('30000000-0000-0000-0001-000000000002', 158, 'mg/dL', 'fasting',     now() - interval '3 days', '20000000-0000-0000-0001-000000000002', 'voice', false),
  ('30000000-0000-0000-0001-000000000002', 142, 'mg/dL', 'fasting',     now() - interval '2 days', '20000000-0000-0000-0001-000000000002', 'voice', false),
  ('30000000-0000-0000-0001-000000000002', 138, 'mg/dL', 'fasting',     now() - interval '1 day',  '20000000-0000-0000-0001-000000000002', 'voice', false),
  ('30000000-0000-0000-0001-000000000002', 148, 'mg/dL', 'fasting',     now() - interval '3 hours','20000000-0000-0000-0001-000000000002', 'voice', false)
on conflict do nothing;

-- ---------- Wellness check-ins ---------------------------------------
insert into public.wellness_checkins (senior_id, mood, sleep_quality, water_intake_oz, meals_eaten, energy_level, checked_in_at, source) values
  ('30000000-0000-0000-0001-000000000001', 'good',  'good', 32, 3, 'medium', now() - interval '6 days', 'voice'),
  ('30000000-0000-0000-0001-000000000001', 'great', 'great',40, 3, 'high',   now() - interval '5 days', 'voice'),
  ('30000000-0000-0000-0001-000000000001', 'okay',  'fair', 24, 2, 'medium', now() - interval '4 days', 'voice'),
  ('30000000-0000-0000-0001-000000000001', 'good',  'good', 32, 3, 'medium', now() - interval '3 days', 'voice'),
  ('30000000-0000-0000-0001-000000000001', 'good',  'good', 32, 3, 'medium', now() - interval '2 days', 'voice'),
  ('30000000-0000-0000-0001-000000000001', 'great', 'great',40, 3, 'high',   now() - interval '1 day',  'voice'),
  ('30000000-0000-0000-0001-000000000001', 'good',  'good', 16, 1, 'medium', now() - interval '2 hours','voice'),
  ('30000000-0000-0000-0001-000000000002', 'lonely','fair', 24, 2, 'low',    now() - interval '5 days', 'voice'),
  ('30000000-0000-0000-0001-000000000002', 'sad',   'poor', 16, 2, 'low',    now() - interval '3 days', 'voice'),
  ('30000000-0000-0000-0001-000000000002', 'okay',  'good', 32, 3, 'medium', now() - interval '1 day',  'voice'),
  ('30000000-0000-0000-0001-000000000002', 'okay',  'fair', 16, 2, 'low',    now() - interval '4 hours','voice')
on conflict do nothing;

-- ---------- Risk alerts ----------------------------------------------
insert into public.risk_alerts (senior_id, severity, status, category, title, description, source, created_at) values
  ('30000000-0000-0000-0001-000000000001', 'medium', 'open',         'health',
   'Blood pressure trending high',
   'Reading of 145/92 on day 4 was above the safe range. Two later readings returned to normal.',
   'ai', now() - interval '4 days'),
  ('30000000-0000-0000-0001-000000000001', 'low',    'acknowledged', 'medication',
   'Evening medicine running low',
   'Atorvastatin refill due in 5 days based on current pace.',
   'system', now() - interval '2 days'),
  ('30000000-0000-0000-0001-000000000002', 'high',   'open',         'wellness',
   'Loneliness signal',
   'Robert reported feeling lonely or sad on 2 of the last 5 days. Consider a family call or visit.',
   'ai', now() - interval '3 days'),
  ('30000000-0000-0000-0001-000000000002', 'medium', 'open',         'medication',
   'Missed Aspirin this morning',
   'Scheduled at 8:00 AM, no log recorded.',
   'system', now() - interval '3 hours')
on conflict do nothing;

-- ---------- Notes from staff -----------------------------------------
insert into public.notes (senior_id, author_id, content, is_private) values
  ('30000000-0000-0000-0001-000000000001', '20000000-0000-0000-0003-000000000001',
   'Eleanor came to the center Wednesday for the gardening club. Bright mood, said she enjoyed it.', false),
  ('30000000-0000-0000-0001-000000000001', '20000000-0000-0000-0003-000000000001',
   'Reminder: cardiology follow-up scheduled for this afternoon.', false),
  ('30000000-0000-0000-0001-000000000002', '20000000-0000-0000-0003-000000000001',
   'Robert seemed a bit withdrawn this week. Encouraged him to join Friday''s music hour.', false),
  ('30000000-0000-0000-0001-000000000002', '20000000-0000-0000-0003-000000000001',
   'Blood sugar trending well after diet adjustment. Will continue to monitor.', false)
on conflict do nothing;

-- ---------- Family voice messages ------------------------------------
insert into public.family_voice_messages (senior_id, sender_user_id, message_text, is_read, created_at) values
  ('30000000-0000-0000-0001-000000000001', '20000000-0000-0000-0002-000000000001',
   'Hi Mom! The kids are coming over Sunday. Can''t wait to see you.', false, now() - interval '6 hours'),
  ('30000000-0000-0000-0001-000000000001', '20000000-0000-0000-0002-000000000001',
   'Don''t forget your cardiology appointment today. I''ll call after.', false, now() - interval '2 hours'),
  ('30000000-0000-0000-0001-000000000002', '20000000-0000-0000-0002-000000000002',
   'Hey Dad. Thinking of you. Want to play chess online tonight?', true, now() - interval '1 day')
on conflict do nothing;

-- ---------- Center activities ----------------------------------------
insert into public.center_activities (
  care_center_id, created_by, title, activity_type, description, scheduled_at,
  duration_minutes, location, transportation_provided, tags
) values
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0003-000000000001',
   'Bingo Afternoon', 'bingo', 'Friendly afternoon bingo with light snacks.',
   date_trunc('day', now()) + interval '14 hours', 90, 'Main Hall', false, array['social','games']),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0003-000000000001',
   'Gentle Stretch Class', 'exercise', 'Chair-based stretching, suitable for all mobility levels.',
   date_trunc('day', now()) + interval '1 day 10 hours', 45, 'Wellness Room', true, array['exercise','wellness']),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0003-000000000001',
   'Music Hour: Classical', 'music', 'Live pianist performing favorites.',
   date_trunc('day', now()) + interval '2 days 15 hours', 60, 'Lounge', true, array['music','social'])
on conflict do nothing;

-- ---------- Daily care status ----------------------------------------
insert into public.daily_care_status (
  senior_id, status_date, overall_status, medicine_status, meal_status,
  hydration_status, mood_status, health_status, checkin_completed,
  missed_reminders_count, open_alerts_count
) values
  ('30000000-0000-0000-0001-000000000001', current_date, 'green',  'green', 'green', 'green', 'green',  'yellow', true, 0, 1),
  ('30000000-0000-0000-0001-000000000002', current_date, 'yellow', 'yellow','green', 'yellow','yellow', 'green',  true, 1, 2)
on conflict (senior_id, status_date) do nothing;

-- ---------- Weekly progress reports ----------------------------------
insert into public.weekly_progress_reports (
  senior_id, week_start, week_end, med_compliance_pct,
  missed_reminders_count, loneliness_logs_count,
  bp_logs_count, sugar_logs_count, wellness_checkins_count,
  ai_summary
) values
  ('30000000-0000-0000-0001-000000000001',
   current_date - interval '7 days', current_date - interval '1 day', 95.0,
   1, 0, 7, 0, 7,
   'Eleanor had a strong week. Medicine compliance at 95%. Mood was steady, with one fair-energy day midweek. One blood-pressure reading on day 4 was elevated (145/92) but later readings returned to normal. Recommend continued daily logging.'),
  ('30000000-0000-0000-0001-000000000002',
   current_date - interval '7 days', current_date - interval '1 day', 78.0,
   3, 2, 3, 7, 4,
   'Robert had a mixed week. Medication compliance was 78%, with three missed evening doses. Loneliness reported on two days. Blood sugar control improved overall. Suggest a family call this weekend and a visit to the social music hour.')
on conflict (senior_id, week_start) do nothing;

-- ---------- Voice conversations (sample) -----------------------------
insert into public.voice_conversations (senior_id, transcript, ai_reply, intent, action_taken, action_confirmed, safety_flag, created_at) values
  ('30000000-0000-0000-0001-000000000001', 'I took my morning medicine',
   'I marked your morning medicine as taken. Have a wonderful day.',
   'mark_med_taken', 'mark_med_taken', true, false, now() - interval '5 hours'),
  ('30000000-0000-0000-0001-000000000001', 'What is on my calendar today?',
   'Today you have lunch at 12, a cardiology appointment with Dr. Webb at 2, and dinner at 6. Would you like a reminder?',
   'read_day', null, false, false, now() - interval '4 hours'),
  ('30000000-0000-0000-0001-000000000002', 'I feel a little lonely today',
   'Thank you for sharing that with me, Robert. I have noted how you are feeling. Would you like me to send a message to David?',
   'log_mood', 'log_mood', false, false, now() - interval '4 hours'),
  ('30000000-0000-0000-0001-000000000002', 'My blood sugar is 148',
   'Shall I save your blood sugar reading of 148 mg/dL?',
   'log_sugar', 'log_sugar', true, false, now() - interval '3 hours')
on conflict do nothing;

-- ---------- Audit logs (sample) --------------------------------------
insert into public.audit_logs (actor_id, target_senior_id, action, resource_type, payload, created_at) values
  ('20000000-0000-0000-0001-000000000001', '30000000-0000-0000-0001-000000000001', 'ai_chat', 'voice_conversation', '{"intent":"mark_med_taken"}'::jsonb, now() - interval '5 hours'),
  ('20000000-0000-0000-0002-000000000001', '30000000-0000-0000-0001-000000000001', 'medication_schedule_create', 'medication_schedule', '{"med_name":"Lisinopril"}'::jsonb, now() - interval '30 days'),
  ('20000000-0000-0000-0003-000000000001', '30000000-0000-0000-0001-000000000002', 'note_create', 'note', '{"length":85}'::jsonb, now() - interval '2 days')
on conflict do nothing;

-- =====================================================================
-- Done. Visit /login and sign in with any of the demo emails above
-- (password = demo1234) to explore each role.
-- =====================================================================
