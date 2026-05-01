import type { CalendarEvent } from "@/types/domain";
import { formatTime } from "./date";

const HOUR = new Date().getHours();
const greeting = () => (HOUR < 12 ? "Good morning" : HOUR < 18 ? "Good afternoon" : "Good evening");

export const EVENT_GROUPS: { label: string; types: string[] }[] = [
  { label: "Medicine", types: ["medicine"] },
  { label: "Meals", types: ["meal"] },
  { label: "Hydration", types: ["hydration"] },
  { label: "Health checks", types: ["bp_check", "sugar_check", "pulse_check", "weight_check", "temp_check"] },
  { label: "Appointments", types: ["doctor_appointment", "therapy"] },
  { label: "Senior center visits", types: ["center_visit", "social_activity"] },
  { label: "Other", types: ["transportation", "exercise", "family_call", "custom"] },
];

export function groupEvents(events: CalendarEvent[]) {
  const buckets: Record<string, CalendarEvent[]> = {};
  for (const g of EVENT_GROUPS) buckets[g.label] = [];
  for (const e of events) {
    const group = EVENT_GROUPS.find((g) => g.types.includes(e.event_type)) ?? EVENT_GROUPS[EVENT_GROUPS.length - 1];
    buckets[group.label].push(e);
  }
  return buckets;
}

export function buildBriefingText(
  seniorName: string,
  events: CalendarEvent[],
  timezone = "America/New_York",
): string {
  const firstName = seniorName.split(" ")[0];
  const pending = events.filter((e) => !e.is_completed && !e.is_cancelled);

  if (pending.length === 0) {
    return `${greeting()}, ${firstName}. You have no scheduled reminders today. Enjoy your day.`;
  }

  const sentences: string[] = [`${greeting()}, ${firstName}.`];
  sentences.push(`Today you have ${pending.length} reminder${pending.length === 1 ? "" : "s"}.`);

  const groups = groupEvents(pending);
  for (const g of EVENT_GROUPS) {
    const items = groups[g.label];
    if (items.length === 0) continue;
    const parts = items.map((e) => `${e.title} at ${formatTime(e.scheduled_at, timezone)}`);
    sentences.push(`${g.label}: ${parts.join(", ")}.`);
  }

  sentences.push("Tap Talk if you would like to mark anything complete or ask a question.");
  return sentences.join(" ");
}
