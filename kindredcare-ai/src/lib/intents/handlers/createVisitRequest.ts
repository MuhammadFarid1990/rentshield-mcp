import type { SupabaseClient } from "@supabase/supabase-js";
import { logAudit } from "@/lib/audit/log";
import { addDays, format } from "date-fns";

export async function createVisitRequest(
  supabase: SupabaseClient,
  seniorId: string,
  requestedBy: string,
  entities: { requestedDate?: string },
) {
  // Find the senior's linked care center
  const { data: link } = await supabase
    .from("senior_center_links")
    .select("care_center_id")
    .eq("senior_id", seniorId)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!link) {
    return { success: false, message: "I do not have a senior care center linked to your profile yet. Please ask your guardian or caregiver to set it up." };
  }

  const requestedDate =
    entities.requestedDate === "tomorrow"
      ? format(addDays(new Date(), 1), "yyyy-MM-dd")
      : format(addDays(new Date(), 1), "yyyy-MM-dd");

  const { error } = await supabase.from("visit_requests").insert({
    senior_id: seniorId,
    care_center_id: link.care_center_id,
    requested_by: requestedBy,
    requested_date: requestedDate,
    status: "pending",
  });

  if (error) return { success: false, message: "I could not submit your visit request. Please try again." };

  await logAudit(supabase, requestedBy, seniorId, "create_visit_request", { requestedDate });

  return {
    success: true,
    message: `I have sent a visit request to your senior care center for ${requestedDate}. They will confirm the details soon.`,
  };
}
