import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAudit(
  supabase: SupabaseClient,
  actorId: string,
  targetSeniorId: string | null,
  action: string,
  payload?: Record<string, unknown>,
) {
  const { error } = await supabase.from("audit_logs").insert({
    actor_id: actorId,
    target_senior_id: targetSeniorId,
    action,
    payload: payload ?? {},
  });

  if (error) {
    // Surface failures so we don't silently lose the audit trail
    // (early builds had no INSERT RLS policy for non-admins, so every
    // logAudit() was a no-op without anyone noticing).
    console.error("[audit] failed to write", { actorId, targetSeniorId, action, error: error.message });
    if (process.env.NODE_ENV !== "production") {
      throw new Error(`logAudit failed: ${error.message}`);
    }
  }
}
