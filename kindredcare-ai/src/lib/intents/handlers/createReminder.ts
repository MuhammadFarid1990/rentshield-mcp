import type { SupabaseClient } from "@supabase/supabase-js";
import { logAudit } from "@/lib/audit/log";
import { addHours } from "date-fns";

const KEYWORD_TO_TYPE: Record<string, string> = {
  water: "hydration", drink: "hydration", hydrate: "hydration",
  medicine: "medicine", medication: "medicine", pill: "medicine",
  walk: "exercise", exercise: "exercise",
  meal: "meal", breakfast: "meal", lunch: "meal", dinner: "meal", eat: "meal",
  doctor: "doctor_appointment", appointment: "doctor_appointment",
};

export async function createReminder(
  supabase: SupabaseClient,
  seniorId: string,
  createdBy: string,
  entities: { rawText?: string },
) {
  const text = (entities.rawText ?? "").toLowerCase();
  let eventType = "custom";
  for (const [kw, t] of Object.entries(KEYWORD_TO_TYPE)) {
    if (text.includes(kw)) { eventType = t; break; }
  }

  const title = (entities.rawText ?? "Reminder")
    .replace(/^(remind me to|set a reminder to|add a reminder to|please remind me to)\s*/i, "")
    .slice(0, 100) || "Reminder";

  const scheduled = addHours(new Date(), 1);

  const { error } = await supabase.from("calendar_events").insert({
    senior_id: seniorId,
    created_by: createdBy,
    event_type: eventType,
    title,
    scheduled_at: scheduled.toISOString(),
    voice_alert: true,
  });

  if (error) return { success: false, message: "I could not save that reminder." };

  await logAudit(supabase, createdBy, seniorId, "create_reminder", { title, eventType });

  return {
    success: true,
    message: `I have set a reminder for "${title}" in one hour. You can adjust the time on your calendar.`,
  };
}
