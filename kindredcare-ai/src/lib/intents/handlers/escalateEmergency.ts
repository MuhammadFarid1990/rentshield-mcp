import type { SupabaseClient } from "@supabase/supabase-js";
import { logAudit } from "@/lib/audit/log";

export async function escalateEmergency(
  supabase: SupabaseClient,
  seniorId: string,
  triggeredBy: string,
  matchedPhrase: string,
) {
  // Create critical risk alert
  await supabase.from("risk_alerts").insert({
    senior_id: seniorId,
    triggered_by: triggeredBy,
    severity: "critical",
    category: "emergency",
    title: "Emergency phrase detected",
    description: `Senior said: "${matchedPhrase}". App escalated to emergency UI.`,
    source: "voice",
  });

  await logAudit(supabase, triggeredBy, seniorId, "emergency_escalation", { matchedPhrase });

  return {
    success: true,
    message: "This may be serious. Please call emergency services (911) right away or ask someone nearby for help.",
  };
}
