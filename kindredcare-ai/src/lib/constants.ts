export const APP_NAME = "KindredCare AI";
export const APP_TAGLINE = "Your caring companion, always nearby.";

export const ROLES = {
  SENIOR: "senior",
  GUARDIAN: "guardian",
  STAFF: "staff",
  ADMIN: "admin",
} as const;

export const CARE_STATUS = {
  GREEN: "green",
  YELLOW: "yellow",
  RED: "red",
} as const;

export const CALENDAR_EVENT_TYPES = [
  { value: "medicine", label: "Medicine", icon: "💊" },
  { value: "bp_check", label: "Blood Pressure Check", icon: "❤️" },
  { value: "sugar_check", label: "Blood Sugar Check", icon: "🩸" },
  { value: "pulse_check", label: "Pulse Check", icon: "💓" },
  { value: "weight_check", label: "Weight Check", icon: "⚖️" },
  { value: "temp_check", label: "Temperature Check", icon: "🌡️" },
  { value: "meal", label: "Meal", icon: "🍽️" },
  { value: "hydration", label: "Hydration / Water", icon: "💧" },
  { value: "doctor_appointment", label: "Doctor Appointment", icon: "🏥" },
  { value: "center_visit", label: "Senior Center Visit", icon: "🏛️" },
  { value: "transportation", label: "Transportation Pickup", icon: "🚗" },
  { value: "exercise", label: "Exercise / Walk", icon: "🚶" },
  { value: "therapy", label: "Therapy", icon: "🧠" },
  { value: "family_call", label: "Family Call", icon: "📞" },
  { value: "social_activity", label: "Social Activity", icon: "👥" },
  { value: "custom", label: "Custom Task", icon: "📝" },
] as const;

export const QUICK_ADD_PRESETS = [
  { id: "morning_med", label: "Morning Medicine", event_type: "medicine", default_time: "08:00" },
  { id: "evening_med", label: "Evening Medicine", event_type: "medicine", default_time: "20:00" },
  { id: "bp_check", label: "Blood Pressure Check", event_type: "bp_check", default_time: "09:00" },
  { id: "sugar_check", label: "Blood Sugar Check", event_type: "sugar_check", default_time: "07:30" },
  { id: "breakfast", label: "Breakfast Reminder", event_type: "meal", default_time: "08:00" },
  { id: "lunch", label: "Lunch Reminder", event_type: "meal", default_time: "12:00" },
  { id: "dinner", label: "Dinner Reminder", event_type: "meal", default_time: "18:00" },
  { id: "water", label: "Water Reminder", event_type: "hydration", default_time: "10:00" },
  { id: "walk", label: "Exercise / Walk", event_type: "exercise", default_time: "09:00" },
  { id: "doctor", label: "Doctor Appointment", event_type: "doctor_appointment", default_time: "10:00" },
  { id: "center_visit", label: "Senior Center Visit", event_type: "center_visit", default_time: "14:00" },
  { id: "transport", label: "Transportation Pickup", event_type: "transportation", default_time: "09:30" },
  { id: "family_call", label: "Family Call", event_type: "family_call", default_time: "16:00" },
  { id: "custom", label: "Custom Reminder", event_type: "custom", default_time: "09:00" },
] as const;

export const MOOD_OPTIONS = [
  { value: "great", label: "Great", emoji: "😄" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "lonely", label: "Lonely", emoji: "😔" },
  { value: "sad", label: "Sad", emoji: "😢" },
  { value: "anxious", label: "Anxious", emoji: "😟" },
  { value: "unwell", label: "Not Feeling Well", emoji: "🤒" },
] as const;

export const ACTIVITY_TYPES = [
  { value: "lunch", label: "Lunch Gathering" },
  { value: "exercise", label: "Light Exercise" },
  { value: "music", label: "Music Activity" },
  { value: "bingo", label: "Bingo" },
  { value: "walking", label: "Walking Group" },
  { value: "memory", label: "Memory Games" },
  { value: "birthday", label: "Birthday Event" },
  { value: "family_visit", label: "Family Visit Day" },
  { value: "prayer", label: "Prayer / Reflection" },
  { value: "education", label: "Education Session" },
  { value: "custom", label: "Custom Activity" },
] as const;

export const DISCLAIMER = "KindredCare AI is not a doctor and is not intended for medical diagnosis or treatment. Always consult a qualified healthcare professional for medical advice.";

export const MISSING_INFO_REPLY = "I do not have that information yet. Please ask your guardian or senior care center to add it.";

export const ROUTES = {
  LANDING: "/",
  ROLE_SELECT: "/role-select",
  LOGIN: "/login",
  SIGNUP_SENIOR: "/signup/senior",
  SIGNUP_GUARDIAN: "/signup/guardian",
  SIGNUP_STAFF: "/signup/staff",
  SENIOR_HOME: "/home",
  SENIOR_TALK: "/talk",
  SENIOR_TODAY: "/today",
  SENIOR_CALENDAR: "/calendar",
  SENIOR_MEDICATION: "/medication",
  SENIOR_HEALTH: "/health",
  SENIOR_WELLNESS: "/wellness",
  SENIOR_HELP: "/help",
  SENIOR_MESSAGES: "/messages",
  GUARDIAN_DASHBOARD: "/guardian/dashboard",
  CENTER_MONITORING: "/center/monitoring",
  CENTER_ATTENTION: "/center/attention",
  ADMIN_DASHBOARD: "/admin/dashboard",
} as const;
