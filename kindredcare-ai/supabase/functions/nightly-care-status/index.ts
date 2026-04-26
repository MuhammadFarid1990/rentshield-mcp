// Supabase Edge Function: nightly-care-status
// Schedule: 0 4 * * *  (daily at 4 AM UTC)
// Computes daily care status for every active senior.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const authHeader = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${Deno.env.get("CRON_SECRET") ?? ""}`;
  if (authHeader !== expected) return new Response("Unauthorized", { status: 401 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: seniors } = await supabase.from("seniors").select("id");
  if (!seniors) return new Response("No seniors", { status: 200 });

  const today = new Date().toISOString().slice(0, 10);
  const dayStart = new Date(today + "T00:00:00").toISOString();
  const dayEnd = new Date(today + "T23:59:59").toISOString();

  for (const s of seniors) {
    const [{ data: medLogs }, { data: alerts }, { data: bp }, { data: checkin }] = await Promise.all([
      supabase.from("medication_logs").select("status").eq("senior_id", s.id).gte("scheduled_time", dayStart).lte("scheduled_time", dayEnd),
      supabase.from("risk_alerts").select("severity").eq("senior_id", s.id).in("status", ["open", "acknowledged"]),
      supabase.from("blood_pressure_records").select("out_of_range").eq("senior_id", s.id).gte("recorded_at", dayStart),
      supabase.from("wellness_checkins").select("mood").eq("senior_id", s.id).gte("checked_in_at", dayStart).order("checked_in_at", { ascending: false }).limit(1),
    ]);

    const missed = (medLogs ?? []).filter((l: { status: string }) => l.status === "missed").length;
    const total = (medLogs ?? []).length;
    const medStatus = total === 0 ? "green" : missed / total > 0.5 ? "red" : missed > 0 ? "yellow" : "green";
    const outOfRangeBP = (bp ?? []).filter((r: { out_of_range: boolean }) => r.out_of_range).length;
    const healthStatus = outOfRangeBP >= 2 ? "red" : outOfRangeBP === 1 ? "yellow" : "green";
    const lastMood = (checkin ?? [])[0]?.mood;
    const moodStatus = !lastMood ? "yellow" : ["lonely", "sad", "anxious", "unwell"].includes(lastMood) ? "yellow" : "green";
    const hasCritical = (alerts ?? []).some((a: { severity: string }) => a.severity === "critical");
    const hasHigh = (alerts ?? []).some((a: { severity: string }) => a.severity === "high");

    const overall = hasCritical || medStatus === "red" || healthStatus === "red"
      ? "red"
      : hasHigh || medStatus === "yellow" || healthStatus === "yellow" || moodStatus === "yellow"
      ? "yellow" : "green";

    await supabase.from("daily_care_status").upsert({
      senior_id: s.id,
      status_date: today,
      overall_status: overall,
      medicine_status: medStatus,
      meal_status: "green",
      hydration_status: "green",
      mood_status: moodStatus,
      health_status: healthStatus,
      checkin_completed: (checkin ?? []).length > 0,
      missed_reminders_count: missed,
      open_alerts_count: (alerts ?? []).length,
      computed_at: new Date().toISOString(),
    }, { onConflict: "senior_id,status_date" });
  }

  return new Response(JSON.stringify({ processed: seniors.length }), { headers: { "Content-Type": "application/json" } });
});
