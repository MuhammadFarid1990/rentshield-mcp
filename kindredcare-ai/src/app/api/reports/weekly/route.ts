import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { buildWeeklySummaryPrompt } from "@/lib/ai/prompts/briefing";
import { startOfWeek, endOfWeek, format, subDays } from "date-fns";
import { pickOne } from "@/lib/utils/relation";
import { z } from "zod";

const schema = z.object({ seniorId: z.string().uuid() });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const seniorId = parsed.data.seniorId;
  const now = new Date();
  const weekStart = startOfWeek(subDays(now, 7));
  const weekEnd = endOfWeek(subDays(now, 7));

  const [{ data: senior }, { data: medLogs }, { data: bp }, { data: sugar }, { data: missed }, { data: lonely }, { data: checkins }] = await Promise.all([
    supabase.from("seniors").select("preferred_name, user:users(full_name)").eq("id", seniorId).single(),
    supabase.from("medication_logs").select("status").eq("senior_id", seniorId).gte("scheduled_time", weekStart.toISOString()).lte("scheduled_time", weekEnd.toISOString()),
    supabase.from("blood_pressure_records").select("id").eq("senior_id", seniorId).gte("recorded_at", weekStart.toISOString()).lte("recorded_at", weekEnd.toISOString()),
    supabase.from("blood_sugar_records").select("id").eq("senior_id", seniorId).gte("recorded_at", weekStart.toISOString()).lte("recorded_at", weekEnd.toISOString()),
    supabase.from("missed_reminder_alerts").select("id").eq("senior_id", seniorId).gte("created_at", weekStart.toISOString()).lte("created_at", weekEnd.toISOString()),
    supabase.from("wellness_checkins").select("id").eq("senior_id", seniorId).eq("mood", "lonely").gte("checked_in_at", weekStart.toISOString()).lte("checked_in_at", weekEnd.toISOString()),
    supabase.from("wellness_checkins").select("id").eq("senior_id", seniorId).gte("checked_in_at", weekStart.toISOString()).lte("checked_in_at", weekEnd.toISOString()),
  ]);

  const totalDoses = (medLogs ?? []).length;
  const takenDoses = (medLogs ?? []).filter((l) => l.status === "taken").length;
  const compliance = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  const seniorUser = pickOne(senior?.user as { full_name?: string | null } | { full_name?: string | null }[] | null | undefined);
  const stats = {
    seniorName: senior?.preferred_name ?? seniorUser?.full_name ?? "Senior",
    medCompliancePct: compliance,
    missedReminders: (missed ?? []).length,
    lonelinessLogs: (lonely ?? []).length,
    bpLogs: (bp ?? []).length,
    sugarLogs: (sugar ?? []).length,
    wellnessCheckins: (checkins ?? []).length,
  };

  const ai = getAIProvider();
  const result = await ai.complete({
    system: "You write warm, simple weekly progress summaries for senior care guardians. Use only provided facts.",
    messages: [{ role: "user", content: buildWeeklySummaryPrompt(stats) }],
    maxTokens: 256,
  });

  await supabase.from("weekly_progress_reports").upsert({
    senior_id: seniorId,
    week_start: format(weekStart, "yyyy-MM-dd"),
    week_end: format(weekEnd, "yyyy-MM-dd"),
    med_compliance_pct: compliance,
    missed_reminders_count: stats.missedReminders,
    loneliness_logs_count: stats.lonelinessLogs,
    bp_logs_count: stats.bpLogs,
    sugar_logs_count: stats.sugarLogs,
    wellness_checkins_count: stats.wellnessCheckins,
    ai_summary: result.text,
  }, { onConflict: "senior_id,week_start" });

  return NextResponse.json({ summary: result.text, stats });
}
