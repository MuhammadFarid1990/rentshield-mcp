// Supabase Edge Function: missed-reminder-sweeper
// Schedule: */15 * * * *  (every 15 minutes)
// Marks past pending events as missed and creates alerts.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const authHeader = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${Deno.env.get("CRON_SECRET") ?? ""}`;
  if (authHeader !== expected) return new Response("Unauthorized", { status: 401 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  // Find missed med logs
  const { data: missedMeds } = await supabase
    .from("medication_logs")
    .select("id, senior_id, med_name, scheduled_time")
    .eq("status", "pending")
    .lt("scheduled_time", fifteenMinAgo);

  for (const log of missedMeds ?? []) {
    await supabase.from("medication_logs").update({ status: "missed" }).eq("id", log.id);
    await supabase.from("missed_reminder_alerts").insert({
      senior_id: log.senior_id,
      event_type: "medicine",
      title: `Missed: ${log.med_name}`,
      scheduled_at: log.scheduled_time,
    });
  }

  // Find missed calendar events (any non-medicine)
  const { data: missedEvents } = await supabase
    .from("calendar_events")
    .select("id, senior_id, title, event_type, scheduled_at")
    .eq("is_completed", false)
    .eq("is_cancelled", false)
    .lt("scheduled_at", fifteenMinAgo);

  for (const e of missedEvents ?? []) {
    // Don't double-create alerts
    const { data: existing } = await supabase
      .from("missed_reminder_alerts")
      .select("id")
      .eq("calendar_event_id", e.id)
      .limit(1)
      .single();

    if (!existing) {
      await supabase.from("missed_reminder_alerts").insert({
        senior_id: e.senior_id,
        calendar_event_id: e.id,
        event_type: e.event_type,
        title: `Missed: ${e.title}`,
        scheduled_at: e.scheduled_at,
      });
    }
  }

  return new Response(JSON.stringify({
    missedMeds: (missedMeds ?? []).length,
    missedEvents: (missedEvents ?? []).length,
  }), { headers: { "Content-Type": "application/json" } });
});
