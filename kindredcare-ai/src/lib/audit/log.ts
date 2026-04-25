import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAudit(
  supabase: SupabaseClient,
  actorId: string,
  targetSeniorId: string,
  action: string,
  payload?: Record<string, unknown>,
) {
  await supabase.from("audit_logs").insert({
    actor_id: actorId,
    target_senior_id: targetSeniorId,
    action,
    payload: payload ?? {},
  });
}
