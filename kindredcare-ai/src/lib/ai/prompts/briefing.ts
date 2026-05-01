import type { CalendarEvent } from "@/types/domain";
import { formatTime } from "@/lib/utils/date";

export function buildDailyBriefingPrompt(
  seniorName: string,
  todayEvents: CalendarEvent[],
  timezone: string,
): string {
  const name = seniorName.split(" ")[0];
  const timeNow = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: timezone });

  if (todayEvents.length === 0) {
    return `You are a caring AI companion. Greet ${name} warmly. Tell them it is ${timeNow} and they have no scheduled reminders today. Encourage them to relax and enjoy the day. Keep it brief, warm, and uplifting.`;
  }

  const eventLines = todayEvents
    .filter((e) => !e.is_completed && !e.is_cancelled)
    .map((e) => `- ${formatTime(e.scheduled_at, timezone)}: ${e.title}`)
    .join("\n");

  return `You are a caring AI companion. Read this daily briefing for ${name} in a warm, calm voice. Keep sentences short. Do not add any information not listed below.

Today's schedule for ${name}:
${eventLines}

Instructions: Start with "Good morning/afternoon/evening, ${name}." Then read each item naturally. End with an encouraging sentence. Do not invent any additional events or health advice.`;
}

export function buildWeeklySummaryPrompt(data: {
  seniorName: string;
  medCompliancePct: number;
  missedReminders: number;
  lonelinessLogs: number;
  bpLogs: number;
  sugarLogs: number;
  wellnessCheckins: number;
}): string {
  return `Write a warm, 3-4 sentence weekly progress summary for ${data.seniorName}'s guardian and care center.

Use ONLY these facts:
- Medicine compliance: ${data.medCompliancePct}%
- Missed reminders: ${data.missedReminders}
- Loneliness reports: ${data.lonelinessLogs}
- Blood pressure logs: ${data.bpLogs}
- Blood sugar logs: ${data.sugarLogs}
- Wellness check-ins: ${data.wellnessCheckins}

Rules:
- Use simple, caring language.
- Do not invent any additional health facts.
- If compliance is below 80%, suggest a gentle follow-up.
- If loneliness logs > 2, suggest a social activity or family call.
- End with one positive note.`;
}
