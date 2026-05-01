import type { SupabaseClient } from "@supabase/supabase-js";
import { logAudit } from "@/lib/audit/log";
import type { SeniorPreferences } from "@/types/domain";

export async function logBP(
  supabase: SupabaseClient,
  seniorId: string,
  recordedBy: string,
  entities: { systolic: number; diastolic: number; pulse?: number },
  prefs: SeniorPreferences | null,
) {
  const { systolic, diastolic, pulse } = entities;

  const outOfRange =
    prefs != null
      ? systolic < prefs.safe_range_bp_systolic_min ||
        systolic > prefs.safe_range_bp_systolic_max ||
        diastolic < prefs.safe_range_bp_diastolic_min ||
        diastolic > prefs.safe_range_bp_diastolic_max
      : false;

  const { error } = await supabase.from("blood_pressure_records").insert({
    senior_id: seniorId,
    systolic,
    diastolic,
    pulse: pulse ?? null,
    recorded_by: recordedBy,
    source: "voice",
    out_of_range: outOfRange,
  });

  if (error) return { success: false, message: "I could not save your blood pressure reading. Please try again." };

  await logAudit(supabase, recordedBy, seniorId, "log_bp", { systolic, diastolic, pulse });

  let message = `I have saved your blood pressure reading of ${systolic} over ${diastolic}.`;
  if (outOfRange) {
    message += " This reading is outside the range set by your caregiver. Would you like to call your doctor, guardian, or senior care center?";
  } else {
    message += " Thank you for keeping track of your health.";
  }

  return { success: true, message, outOfRange };
}
