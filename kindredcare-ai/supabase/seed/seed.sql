-- Demo seed data for KindredCare AI
-- Run AFTER all migrations have applied. Replace UUIDs with actual auth.users IDs from your Supabase project.

-- Example: a single care center
insert into public.care_centers (id, name, address, phone, email, brand_color, timezone)
values (
  '00000000-0000-0000-0000-000000000001',
  'Sunny Acres Senior Center',
  '123 Main St, Anytown, USA',
  '555-0100',
  'info@sunnyacres.example.com',
  '#1e40af',
  'America/New_York'
)
on conflict (id) do nothing;

-- Example: built-in reminder presets (system templates)
insert into public.reminder_templates (event_type, title, default_time, voice_message, is_system) values
  ('medicine', 'Morning Medicine', '08:00', 'Time for your morning medicine.', true),
  ('medicine', 'Evening Medicine', '20:00', 'Time for your evening medicine.', true),
  ('hydration', 'Drink Water', '10:00', 'Please drink a glass of water.', true),
  ('meal', 'Breakfast', '08:00', 'Time for breakfast.', true),
  ('meal', 'Lunch', '12:00', 'Time for lunch.', true),
  ('meal', 'Dinner', '18:00', 'Time for dinner.', true),
  ('exercise', 'Short Walk', '09:00', 'Time for a short walk.', true)
on conflict do nothing;
