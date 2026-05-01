export type UserRole = "senior" | "guardian" | "staff" | "admin";
export type CareStatusLevel = "green" | "yellow" | "red";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "open" | "acknowledged" | "resolved";
export type CalendarEventType =
  | "medicine" | "bp_check" | "sugar_check" | "pulse_check" | "weight_check" | "temp_check"
  | "meal" | "hydration" | "doctor_appointment" | "center_visit" | "transportation"
  | "exercise" | "therapy" | "family_call" | "social_activity" | "custom";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  phone?: string | null;
  timezone: string;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface Senior {
  id: string;
  user_id: string;
  date_of_birth?: string | null;
  age?: number | null;
  preferred_name?: string | null;
  primary_language: string;
  secondary_language?: string | null;
  voice_speed: number;
  response_style: string;
  mobility_notes?: string | null;
  diet_notes?: string | null;
  allergies?: string | null;
  transportation_needs?: string | null;
  favorite_activities?: string[] | null;
  wake_time?: string | null;
  sleep_time?: string | null;
  breakfast_time?: string | null;
  lunch_time?: string | null;
  dinner_time?: string | null;
  wellness_checkin_preference: string;
  high_contrast: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Guardian {
  id: string;
  user_id: string;
  relationship?: string | null;
  created_at: string;
  user?: User;
}

export interface CareCenter {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo_url?: string | null;
  brand_color: string;
  timezone: string;
}

export interface Staff {
  id: string;
  user_id: string;
  care_center_id: string;
  title?: string | null;
  department?: string | null;
  user?: User;
  care_center?: CareCenter;
}

export interface Doctor {
  id: string;
  senior_id: string;
  full_name: string;
  specialty?: string | null;
  clinic_name?: string | null;
  phone?: string | null;
  office_hours?: string | null;
  notes?: string | null;
  is_primary: boolean;
}

export interface EmergencyContact {
  id: string;
  senior_id: string;
  full_name: string;
  relationship: string;
  phone: string;
  is_primary: boolean;
  sort_order: number;
}

export interface CalendarEvent {
  id: string;
  senior_id: string;
  created_by: string;
  event_type: CalendarEventType;
  title: string;
  description?: string | null;
  scheduled_at: string;
  duration_minutes: number;
  location?: string | null;
  voice_alert: boolean;
  voice_message?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  is_cancelled: boolean;
  recurrence_rule_id?: string | null;
}

export interface MedicationSchedule {
  id: string;
  senior_id: string;
  created_by: string;
  med_name: string;
  dosage: string;
  dosage_unit?: string | null;
  frequency: string;
  times: string[];
  instructions?: string | null;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
  refill_reminder_days: number;
  notify_guardian: boolean;
  notify_center: boolean;
}

export interface MedicationLog {
  id: string;
  senior_id: string;
  schedule_id?: string | null;
  med_name: string;
  scheduled_time: string;
  taken_at?: string | null;
  status: "taken" | "missed" | "skipped" | "pending";
  source: string;
  notes?: string | null;
}

export interface BloodPressureRecord {
  id: string;
  senior_id: string;
  systolic: number;
  diastolic: number;
  pulse?: number | null;
  notes?: string | null;
  recorded_at: string;
  recorded_by: string;
  source: string;
  out_of_range: boolean;
}

export interface BloodSugarRecord {
  id: string;
  senior_id: string;
  value: number;
  unit: string;
  measurement_context?: string | null;
  notes?: string | null;
  recorded_at: string;
  out_of_range: boolean;
}

export interface HealthCheckRecord {
  id: string;
  senior_id: string;
  pulse?: number | null;
  weight_lbs?: number | null;
  temperature_f?: number | null;
  pain_level?: number | null;
  notes?: string | null;
  recorded_at: string;
}

export interface WellnessCheckin {
  id: string;
  senior_id: string;
  mood?: string | null;
  sleep_quality?: string | null;
  water_intake_oz?: number | null;
  meals_eaten?: number | null;
  energy_level?: string | null;
  notes?: string | null;
  checked_in_at: string;
  source: string;
}

export interface RiskAlert {
  id: string;
  senior_id: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: string;
  title: string;
  description?: string | null;
  source: string;
  created_at: string;
}

export interface DailyCareStatus {
  id: string;
  senior_id: string;
  status_date: string;
  overall_status: CareStatusLevel;
  medicine_status: CareStatusLevel;
  meal_status: CareStatusLevel;
  hydration_status: CareStatusLevel;
  mood_status: CareStatusLevel;
  health_status: CareStatusLevel;
  checkin_completed: boolean;
  missed_reminders_count: number;
  open_alerts_count: number;
}

export interface WeeklyProgressReport {
  id: string;
  senior_id: string;
  week_start: string;
  week_end: string;
  med_compliance_pct?: number | null;
  missed_reminders_count: number;
  loneliness_logs_count: number;
  bp_logs_count: number;
  sugar_logs_count: number;
  wellness_checkins_count: number;
  ai_summary?: string | null;
  recommendations?: Record<string, unknown> | null;
  generated_at: string;
}

export interface CenterActivity {
  id: string;
  care_center_id: string;
  title: string;
  activity_type: string;
  description?: string | null;
  scheduled_at: string;
  duration_minutes: number;
  max_participants?: number | null;
  location?: string | null;
  transportation_provided: boolean;
  tags?: string[] | null;
  is_cancelled: boolean;
}

export interface VisitRequest {
  id: string;
  senior_id: string;
  care_center_id: string;
  requested_by: string;
  requested_date: string;
  preferred_time?: string | null;
  reason?: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

export interface TransportationRequest {
  id: string;
  senior_id: string;
  pickup_address?: string | null;
  dropoff_address?: string | null;
  pickup_at: string;
  purpose?: string | null;
  status: "pending" | "confirmed" | "en_route" | "completed" | "cancelled";
}

export interface FamilyVoiceMessage {
  id: string;
  senior_id: string;
  sender_user_id: string;
  message_text: string;
  audio_url?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  sender?: User;
}

export interface VoiceConversation {
  id: string;
  senior_id: string;
  transcript: string;
  ai_reply: string;
  intent?: string | null;
  action_taken?: string | null;
  action_confirmed: boolean;
  safety_flag: boolean;
  safety_reason?: string | null;
  created_at: string;
}

export interface SeniorPreferences {
  id: string;
  senior_id: string;
  ai_response_style: string;
  ai_brand_name: string;
  bilingual_mode: boolean;
  daily_briefing_enabled: boolean;
  daily_briefing_time: string;
  safe_range_bp_systolic_min: number;
  safe_range_bp_systolic_max: number;
  safe_range_bp_diastolic_min: number;
  safe_range_bp_diastolic_max: number;
  safe_range_blood_sugar_min: number;
  safe_range_blood_sugar_max: number;
  safe_range_pulse_min: number;
  safe_range_pulse_max: number;
  safe_range_temp_min: number;
  safe_range_temp_max: number;
}
