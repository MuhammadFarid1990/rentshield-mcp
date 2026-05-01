import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConfirmedAction } from "@/types/intents";
import type { SeniorPreferences } from "@/types/domain";
import { markMedTaken } from "./handlers/markMedTaken";
import { logBP } from "./handlers/logBP";
import { logMood } from "./handlers/logMood";
import { createVisitRequest } from "./handlers/createVisitRequest";

export interface ActionResult {
  success: boolean;
  message: string;
  outOfRange?: boolean;
}

export async function routeConfirmedAction(
  action: ConfirmedAction,
  supabase: SupabaseClient,
  prefs: SeniorPreferences | null,
): Promise<ActionResult> {
  const { intent, entities, seniorId, confirmedBy } = action;

  switch (intent) {
    case "mark_med_taken":
      return markMedTaken(supabase, seniorId, confirmedBy, entities);

    case "log_bp":
      return logBP(
        supabase,
        seniorId,
        confirmedBy,
        { systolic: entities.systolic as number, diastolic: entities.diastolic as number },
        prefs,
      );

    case "log_sugar": {
      const { error } = await supabase.from("blood_sugar_records").insert({
        senior_id: seniorId,
        value: entities.value as number,
        recorded_by: confirmedBy,
        source: "voice",
      });
      if (error) return { success: false, message: "Could not save blood sugar reading." };
      return { success: true, message: `Blood sugar reading of ${entities.value} mg/dL saved.` };
    }

    case "log_mood":
      return logMood(supabase, seniorId, confirmedBy, entities as { mood?: string });

    case "create_visit_request":
      return createVisitRequest(supabase, seniorId, confirmedBy, entities as { requestedDate?: string });

    case "request_transportation": {
      const { error } = await supabase.from("transportation_requests").insert({
        senior_id: seniorId,
        requested_by: confirmedBy,
        pickup_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        purpose: (entities.rawText as string) ?? "transportation request",
        status: "pending",
      });
      if (error) return { success: false, message: "Could not submit transportation request." };
      return { success: true, message: "Transportation request submitted. Your care center will confirm the details." };
    }

    default:
      return { success: false, message: "I was not able to complete that action." };
  }
}
