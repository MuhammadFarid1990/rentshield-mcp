import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SeniorShell } from "@/components/layout/SeniorShell";
import { startOfDay, endOfDay } from "date-fns";
import { relativeDay } from "@/lib/utils/date";
import type { CalendarEvent } from "@/types/domain";
import { ReadDayButton } from "@/components/senior/ReadDayButton";
import { EventCard } from "@/components/senior/EventCard";
import { buildBriefingText, groupEvents, EVENT_GROUPS } from "@/lib/utils/briefing";

export default async function TodayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: senior } = await supabase
    .from("seniors")
    .select("id, preferred_name, high_contrast, primary_language, voice_speed, timezone, user:users(full_name)")
    .eq("user_id", user.id)
    .single();

  if (!senior) redirect("/home");

  const today = new Date();
  const { data: events } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("senior_id", senior.id)
    .gte("scheduled_at", startOfDay(today).toISOString())
    .lte("scheduled_at", endOfDay(today).toISOString())
    .eq("is_cancelled", false)
    .order("scheduled_at");

  const allEvents = (events ?? []) as CalendarEvent[];
  const pending = allEvents.filter((e) => !e.is_completed);
  const done = allEvents.filter((e) => e.is_completed);
  const seniorUser = Array.isArray(senior.user)
    ? (senior.user as { full_name?: string | null }[])[0]
    : (senior.user as { full_name?: string | null } | null);
  const name = senior.preferred_name ?? seniorUser?.full_name ?? "Friend";
  const firstName = name.split(" ")[0];
  const tz = (senior.timezone as string | null) ?? "America/New_York";
  const briefingText = buildBriefingText(name, allEvents, tz);
  const groupedPending = groupEvents(pending);

  return (
    <SeniorShell title="Today" showBack backHref="/home" highContrast={senior.high_contrast}>
      <div className="px-4 py-4 flex flex-col gap-6">
        <div className="text-center">
          <p className="text-senior-xl font-bold text-gray-800">{relativeDay(today.toISOString())}</p>
          <p className="text-senior-base text-gray-600 mt-1">Here is your day, {firstName}.</p>
        </div>

        <ReadDayButton
          briefingText={briefingText}
          voiceSpeed={(senior.voice_speed as number | null) ?? 0.95}
          language={(senior.primary_language as string | null) ?? "en-US"}
        />

        {allEvents.length === 0 && (
          <div className="text-center bg-white rounded-2xl p-8 border-2 border-gray-200">
            <p className="text-5xl mb-3">🌞</p>
            <p className="text-senior-lg text-gray-600">You have no reminders today. Enjoy your day!</p>
          </div>
        )}

        {pending.length > 0 && (
          <section>
            <h2 className="text-senior-lg font-bold text-gray-700 mb-3">Coming Up</h2>
            <div className="flex flex-col gap-5">
              {EVENT_GROUPS.map((g) => {
                const items = groupedPending[g.label];
                if (!items || items.length === 0) return null;
                return (
                  <div key={g.label} className="flex flex-col gap-3">
                    <h3 className="text-senior-base font-semibold text-gray-600 uppercase tracking-wide">
                      {g.label}
                    </h3>
                    {items.map((e) => <EventCard key={e.id} event={e} timezone={tz} />)}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {done.length > 0 && (
          <section>
            <h2 className="text-senior-lg font-bold text-gray-500 mb-3">Completed</h2>
            <div className="flex flex-col gap-3">
              {done.map((e) => <EventCard key={e.id} event={e} timezone={tz} />)}
            </div>
          </section>
        )}

        <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-200 text-center">
          <p className="text-senior-base text-blue-800">
            Tap <strong>Talk</strong> on the home screen to ask about your day or mark reminders complete.
          </p>
        </div>
      </div>
    </SeniorShell>
  );
}
