import type { SupabaseClient } from "@supabase/supabase-js";
import { format, startOfDay, endOfDay } from "date-fns";

export async function buildGroundingContext(
  supabase: SupabaseClient,
  seniorId: string,
  timezone: string,
): Promise<string> {
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();

  const [events, meds, recentBP, recentMood, contacts, doctors] = await Promise.all([
    supabase
      .from("calendar_events")
      .select("title, event_type, scheduled_at, is_completed")
      .eq("senior_id", seniorId)
      .gte("scheduled_at", todayStart)
      .lte("scheduled_at", todayEnd)
      .eq("is_cancelled", false)
      .order("scheduled_at"),

    supabase
      .from("medication_schedules")
      .select("med_name, dosage, times, frequency")
      .eq("senior_id", seniorId)
      .eq("is_active", true),

    supabase
      .from("blood_pressure_records")
      .select("systolic, diastolic, pulse, recorded_at")
      .eq("senior_id", seniorId)
      .order("recorded_at", { ascending: false })
      .limit(3),

    supabase
      .from("wellness_checkins")
      .select("mood, checked_in_at")
      .eq("senior_id", seniorId)
      .order("checked_in_at", { ascending: false })
      .limit(1),

    supabase
      .from("emergency_contacts")
      .select("full_name, relationship, phone, is_primary")
      .eq("senior_id", seniorId)
      .order("sort_order"),

    supabase
      .from("doctors")
      .select("full_name, specialty, phone, clinic_name")
      .eq("senior_id", seniorId)
      .eq("is_primary", true)
      .limit(1),
  ]);

  const lines: string[] = [];

  lines.push(`## TODAY'S SCHEDULE (${format(now, "MMMM d, yyyy")})`);
  if (events.data?.length) {
    events.data.forEach((e) => {
      const time = new Date(e.scheduled_at).toLocaleTimeString("en-US", {
        hour: "numeric", minute: "2-digit", hour12: true, timeZone: timezone,
      });
      lines.push(`- ${time}: ${e.title} [${e.is_completed ? "DONE" : "PENDING"}]`);
    });
  } else {
    lines.push("- No scheduled events today.");
  }

  lines.push("\n## ACTIVE MEDICATIONS");
  if (meds.data?.length) {
    meds.data.forEach((m) => {
      lines.push(`- ${m.med_name} ${m.dosage} — ${m.frequency} at ${m.times?.join(", ")}`);
    });
  } else {
    lines.push("- No active medications on record.");
  }

  lines.push("\n## RECENT BLOOD PRESSURE");
  if (recentBP.data?.length) {
    recentBP.data.forEach((r) => {
      lines.push(`- ${r.systolic}/${r.diastolic} mmHg (pulse: ${r.pulse ?? "not recorded"}) on ${format(new Date(r.recorded_at), "MMM d")}`);
    });
  } else {
    lines.push("- No blood pressure records available.");
  }

  lines.push("\n## RECENT MOOD");
  if (recentMood.data?.length) {
    lines.push(`- Last check-in: ${recentMood.data[0].mood} on ${format(new Date(recentMood.data[0].checked_in_at), "MMM d")}`);
  } else {
    lines.push("- No mood check-in recorded.");
  }

  lines.push("\n## EMERGENCY CONTACTS");
  if (contacts.data?.length) {
    contacts.data.forEach((c) => {
      lines.push(`- ${c.full_name} (${c.relationship}): ${c.phone}${c.is_primary ? " [PRIMARY]" : ""}`);
    });
  } else {
    lines.push("- No emergency contacts on file.");
  }

  lines.push("\n## PRIMARY DOCTOR");
  if (doctors.data?.length) {
    const d = doctors.data[0];
    lines.push(`- Dr. ${d.full_name}${d.specialty ? `, ${d.specialty}` : ""}${d.clinic_name ? ` at ${d.clinic_name}` : ""}${d.phone ? `, phone: ${d.phone}` : ""}`);
  } else {
    lines.push("- No primary doctor on file.");
  }

  return lines.join("\n");
}
