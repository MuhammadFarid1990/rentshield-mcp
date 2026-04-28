import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SeniorShell } from "@/components/layout/SeniorShell";
import { HomeTriad } from "@/components/senior/HomeTriad";
import { NextReminderCard } from "@/components/senior/NextReminderCard";
import { AccessibilityToggle } from "@/components/senior/AccessibilityToggle";
import { getTimeOfDayGreeting } from "@/lib/utils/date";
import type { CalendarEvent } from "@/types/domain";
import { endOfDay } from "date-fns";

export default async function SeniorHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: senior } = await supabase
    .from("seniors")
    .select("id, preferred_name, high_contrast, timezone, user:users(full_name, email)")
    .eq("user_id", user.id)
    .single();

  const rawUser = senior?.user as
    | { full_name?: string | null }
    | { full_name?: string | null }[]
    | null
    | undefined;
  const seniorUser = Array.isArray(rawUser) ? rawUser[0] : rawUser;
  const name = senior?.preferred_name ?? seniorUser?.full_name ?? "Friend";
  const highContrast = senior?.high_contrast ?? false;
  const tz = (senior?.timezone as string | null) ?? "America/New_York";
  const greeting = getTimeOfDayGreeting();

  // Fetch the next pending reminder today (or null).
  const now = new Date();
  let nextEvent: CalendarEvent | null = null;
  if (senior?.id) {
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("senior_id", senior.id)
      .eq("is_cancelled", false)
      .eq("is_completed", false)
      .gte("scheduled_at", now.toISOString())
      .lte("scheduled_at", endOfDay(now).toISOString())
      .order("scheduled_at")
      .limit(1)
      .maybeSingle();
    nextEvent = (data as CalendarEvent | null) ?? null;
  }

  return (
    <SeniorShell highContrast={highContrast}>
      <div className="flex flex-col gap-5 px-4 py-4">
        <HomeTriad greeting={greeting} seniorName={name} />
        <NextReminderCard event={nextEvent} timezone={tz} />
        <AccessibilityToggle initialContrast={highContrast} />
      </div>
    </SeniorShell>
  );
}
