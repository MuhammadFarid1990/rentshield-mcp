import type { SupabaseClient } from "@supabase/supabase-js";
import { startOfDay, endOfDay } from "date-fns";
import { formatTime } from "@/lib/utils/date";

export async function readDay(supabase: SupabaseClient, seniorId: string, timezone: string) {
  const today = new Date();
  const { data: events } = await supabase
    .from("calendar_events")
    .select("title, scheduled_at, is_completed")
    .eq("senior_id", seniorId)
    .gte("scheduled_at", startOfDay(today).toISOString())
    .lte("scheduled_at", endOfDay(today).toISOString())
    .eq("is_cancelled", false)
    .order("scheduled_at");

  if (!events || events.length === 0) {
    return { success: true, message: "You have no scheduled reminders today. Enjoy your day!" };
  }

  const pending = events.filter((e) => !e.is_completed);
  if (pending.length === 0) {
    return { success: true, message: "You've completed everything on your schedule today. Great job!" };
  }

  const list = pending.map((e) => `${formatTime(e.scheduled_at, timezone)}: ${e.title}`).join(", ");
  return { success: true, message: `Here is your day. ${list}.` };
}
