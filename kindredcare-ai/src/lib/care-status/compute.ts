import type { SupabaseClient } from "@supabase/supabase-js";
import type { CareStatusLevel } from "@/types/domain";
import { startOfDay, endOfDay } from "date-fns";

interface CareStatusInput {
  seniorId: string;
  date?: Date;
}

interface DailyStatus {
  overall: CareStatusLevel;
  medicine: CareStatusLevel;
  meal: CareStatusLevel;
  hydration: CareStatusLevel;
  mood: CareStatusLevel;
  health: CareStatusLevel;
  checkinCompleted: boolean;
  missedReminders: number;
  openAlerts: number;
}

export async function computeCareStatus(
  supabase: SupabaseClient,
  { seniorId, date = new Date() }: CareStatusInput,
): Promise<DailyStatus> {
  const dayStart = startOfDay(date).toISOString();
  const dayEnd = endOfDay(date).toISOString();

  const [medLogs, mealEvents, checkin, alerts, bpRecords] = await Promise.all([
    supabase
      .from("medication_logs")
      .select("status")
      .eq("senior_id", seniorId)
      .gte("scheduled_time", dayStart)
      .lte("scheduled_time", dayEnd),

    supabase
      .from("calendar_events")
      .select("event_type, is_completed")
      .eq("senior_id", seniorId)
      .in("event_type", ["meal", "hydration"])
      .gte("scheduled_at", dayStart)
      .lte("scheduled_at", dayEnd),

    supabase
      .from("wellness_checkins")
      .select("mood")
      .eq("senior_id", seniorId)
      .gte("checked_in_at", dayStart)
      .lte("checked_in_at", dayEnd)
      .order("checked_in_at", { ascending: false })
      .limit(1),

    supabase
      .from("risk_alerts")
      .select("severity, status")
      .eq("senior_id", seniorId)
      .in("status", ["open", "acknowledged"]),

    supabase
      .from("blood_pressure_records")
      .select("out_of_range")
      .eq("senior_id", seniorId)
      .gte("recorded_at", dayStart),
  ]);

  // Medicine status
  const logs = medLogs.data ?? [];
  const missedMeds = logs.filter((l) => l.status === "missed").length;
  const totalMeds = logs.length;
  const medStatus: CareStatusLevel =
    totalMeds === 0 ? "green"
    : missedMeds === 0 ? "green"
    : missedMeds / totalMeds > 0.5 ? "red"
    : "yellow";

  // Meal/hydration status
  const meals = (mealEvents.data ?? []).filter((e) => e.event_type === "meal");
  const hydrations = (mealEvents.data ?? []).filter((e) => e.event_type === "hydration");
  const missedMeals = meals.filter((e) => !e.is_completed).length;
  const missedHydration = hydrations.filter((e) => !e.is_completed).length;
  const mealStatus: CareStatusLevel = missedMeals === 0 ? "green" : missedMeals >= 2 ? "red" : "yellow";
  const hydrationStatus: CareStatusLevel = missedHydration === 0 ? "green" : missedHydration >= 2 ? "red" : "yellow";

  // Mood status
  const latestMood = checkin.data?.[0]?.mood;
  const checkinCompleted = (checkin.data?.length ?? 0) > 0;
  const moodStatus: CareStatusLevel =
    !latestMood ? "yellow"
    : ["lonely", "sad", "anxious", "unwell"].includes(latestMood) ? "yellow"
    : "green";

  // Health status (out of range readings)
  const outOfRangeCount = (bpRecords.data ?? []).filter((r) => r.out_of_range).length;
  const healthStatus: CareStatusLevel = outOfRangeCount === 0 ? "green" : outOfRangeCount >= 2 ? "red" : "yellow";

  // Alerts
  const openAlerts = (alerts.data ?? []);
  const hasCritical = openAlerts.some((a) => a.severity === "critical");
  const hasHigh = openAlerts.some((a) => a.severity === "high");

  // Overall
  const statuses = [medStatus, mealStatus, hydrationStatus, moodStatus, healthStatus];
  const overall: CareStatusLevel =
    hasCritical || statuses.includes("red") ? "red"
    : hasHigh || statuses.includes("yellow") ? "yellow"
    : "green";

  const missedReminders = missedMeds + missedMeals + missedHydration;

  return {
    overall,
    medicine: medStatus,
    meal: mealStatus,
    hydration: hydrationStatus,
    mood: moodStatus,
    health: healthStatus,
    checkinCompleted,
    missedReminders,
    openAlerts: openAlerts.length,
  };
}

export async function upsertDailyCareStatus(
  supabase: SupabaseClient,
  seniorId: string,
): Promise<void> {
  const status = await computeCareStatus(supabase, { seniorId });
  const today = new Date().toISOString().slice(0, 10);

  await supabase.from("daily_care_status").upsert({
    senior_id: seniorId,
    status_date: today,
    overall_status: status.overall,
    medicine_status: status.medicine,
    meal_status: status.meal,
    hydration_status: status.hydration,
    mood_status: status.mood,
    health_status: status.health,
    checkin_completed: status.checkinCompleted,
    missed_reminders_count: status.missedReminders,
    open_alerts_count: status.openAlerts,
    computed_at: new Date().toISOString(),
  }, { onConflict: "senior_id,status_date" });
}
