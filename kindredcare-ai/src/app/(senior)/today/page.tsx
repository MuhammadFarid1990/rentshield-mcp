import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SeniorShell } from "@/components/layout/SeniorShell";
import { startOfDay, endOfDay } from "date-fns";
import { formatTime, relativeDay } from "@/lib/utils/date";
import type { CalendarEvent } from "@/types/domain";
import { CALENDAR_EVENT_TYPES } from "@/lib/constants";

function EventCard({ event }: { event: CalendarEvent }) {
  const typeInfo = CALENDAR_EVENT_TYPES.find((t) => t.value === event.event_type);
  return (
    <div
      className={`flex items-center gap-4 p-5 rounded-2xl border-2 ${
        event.is_completed ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"
      } shadow-sm`}
    >
      <span className="text-3xl flex-shrink-0" aria-hidden="true">{typeInfo?.icon ?? "📝"}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-senior-base font-bold leading-tight ${event.is_completed ? "line-through text-gray-400" : "text-gray-900"}`}>
          {event.title}
        </p>
        <p className="text-senior-sm text-gray-500">
          {formatTime(event.scheduled_at)}
        </p>
      </div>
      {event.is_completed && (
        <span className="text-2xl flex-shrink-0" aria-label="Completed">✅</span>
      )}
    </div>
  );
}

export default async function TodayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: senior } = await supabase
    .from("seniors")
    .select("id, preferred_name, high_contrast, primary_language, user:users(full_name)")
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

  const pending = (events ?? []).filter((e) => !e.is_completed);
  const done = (events ?? []).filter((e) => e.is_completed);
  const name = senior.preferred_name ?? (senior.user as { full_name: string })?.full_name ?? "Friend";
  const firstName = name.split(" ")[0];

  return (
    <SeniorShell title="Today" showBack backHref="/home" highContrast={senior.high_contrast}>
      <div className="px-4 py-4 flex flex-col gap-6">
        <div className="text-center">
          <p className="text-senior-xl font-bold text-gray-800">{relativeDay(today.toISOString())}</p>
          <p className="text-senior-base text-gray-600 mt-1">Here is your day, {firstName}.</p>
        </div>

        {events?.length === 0 && (
          <div className="text-center bg-white rounded-2xl p-8 border-2 border-gray-200">
            <p className="text-5xl mb-3">🌞</p>
            <p className="text-senior-lg text-gray-600">You have no reminders today. Enjoy your day!</p>
          </div>
        )}

        {pending.length > 0 && (
          <section>
            <h2 className="text-senior-lg font-bold text-gray-700 mb-3">Coming Up</h2>
            <div className="flex flex-col gap-3">
              {pending.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          </section>
        )}

        {done.length > 0 && (
          <section>
            <h2 className="text-senior-lg font-bold text-gray-500 mb-3">Completed</h2>
            <div className="flex flex-col gap-3">
              {done.map((e) => <EventCard key={e.id} event={e} />)}
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
