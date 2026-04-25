import type { SupabaseClient } from "@supabase/supabase-js";
import { logAudit } from "@/lib/audit/log";

export async function markMedTaken(
  supabase: SupabaseClient,
  seniorId: string,
  confirmedBy: string,
  entities: Record<string, unknown>,
) {
  const now = new Date().toISOString();

  // Find the most recent pending medication log for today
  const { data: pendingLogs } = await supabase
    .from("medication_logs")
    .select("id, med_name, scheduled_time")
    .eq("senior_id", seniorId)
    .eq("status", "pending")
    .gte("scheduled_time", new Date().toISOString().slice(0, 10))
    .order("scheduled_time")
    .limit(5);

  if (!pendingLogs?.length) {
    return { success: false, message: "I could not find any pending medication doses for today." };
  }

  // Mark all due-now meds (within last 2 hours) as taken
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const dueMeds = pendingLogs.filter((l) => l.scheduled_time >= twoHoursAgo);
  const toMark = dueMeds.length > 0 ? dueMeds : [pendingLogs[0]];

  await supabase
    .from("medication_logs")
    .update({ status: "taken", taken_at: now, confirmed_by: confirmedBy, source: "voice" })
    .in("id", toMark.map((m) => m.id));

  await logAudit(supabase, confirmedBy, seniorId, "mark_med_taken", {
    medNames: toMark.map((m) => m.med_name),
    entities,
  });

  const names = toMark.map((m) => m.med_name).join(" and ");
  return { success: true, message: `I have marked ${names} as taken. Good job!` };
}
