import type { SupabaseClient } from "@supabase/supabase-js";
import { logAudit } from "@/lib/audit/log";

const MOOD_MAP: Record<string, string> = {
  lonely: "lonely",
  sad: "sad",
  happy: "great",
  great: "great",
  okay: "okay",
  anxious: "anxious",
  unwell: "unwell",
  dizzy: "unwell",
  tired: "okay",
  good: "good",
};

export async function logMood(
  supabase: SupabaseClient,
  seniorId: string,
  recordedBy: string,
  entities: { mood?: string },
) {
  const rawMood = entities.mood ?? "okay";
  const mappedMood = MOOD_MAP[rawMood.toLowerCase()] ?? "okay";

  const { error } = await supabase.from("wellness_checkins").insert({
    senior_id: seniorId,
    mood: mappedMood,
    source: "voice",
  });

  if (error) return { success: false, message: "I could not save your mood. Please try again." };

  await logAudit(supabase, recordedBy, seniorId, "log_mood", { mood: mappedMood });

  let message = `I have noted that you are feeling ${mappedMood} today.`;
  if (mappedMood === "lonely") {
    message += " Would you like me to remind your family to give you a call, or would you like to check for activities at your senior care center?";
  } else if (mappedMood === "unwell") {
    message += " I hope you feel better soon. Would you like me to contact your guardian or doctor?";
  }

  return { success: true, message };
}
