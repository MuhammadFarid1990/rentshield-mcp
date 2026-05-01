import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SeniorShell } from "@/components/layout/SeniorShell";
import { CALENDAR_EVENT_TYPES } from "@/lib/constants";
import { formatTime, relativeDay } from "@/lib/utils/date";
import { addDays, startOfDay, endOfDay } from "date-fns";

export default async function SeniorCalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: senior } = await supabase
    .from("seniors")
    .select("id, high_contrast")
    .eq("user_id", user.id)
    .single();
  if (!senior) redirect("/home");

  const today = new Date();
  const sevenDays = addDays(today, 7);

  const { data: events } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("senior_id", senior.id)
    .gte("scheduled_at", startOfDay(today).toISOString())
    .lte("scheduled_at", endOfDay(sevenDays).toISOString())
    .eq("is_cancelled", false)
    .order("scheduled_at");

  // Group by day
  const grouped = new Map<string, typeof events>();
  (events ?? []).forEach((e) => {
    const dayKey = e.scheduled_at.slice(0, 10);
    if (!grouped.has(dayKey)) grouped.set(dayKey, []);
    grouped.get(dayKey)!.push(e);
  });

  return (
    <SeniorShell title="My Calendar" showBack backHref="/home" highContrast={senior.high_contrast}>
      <div className="px-4 py-4 flex flex-col gap-6">
        <p className="text-senior-base text-gray-600 text-center">Next 7 days</p>

        {grouped.size === 0 && (
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-5xl mb-3">📅</p>
            <p className="text-senior-lg text-gray-600">No reminders for the next 7 days.</p>
          </div>
        )}

        {[...grouped.entries()].map(([day, dayEvents]) => (
          <section key={day}>
            <h2 className="text-senior-lg font-bold text-gray-700 mb-3 sticky top-16 bg-gray-50 py-1">
              {relativeDay(day + "T00:00:00Z")}
            </h2>
            <div className="flex flex-col gap-3">
              {dayEvents!.map((e) => {
                const typeInfo = CALENDAR_EVENT_TYPES.find((t) => t.value === e.event_type);
                return (
                  <div
                    key={e.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${
                      e.is_completed ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{typeInfo?.icon ?? "📝"}</span>
                    <div className="flex-1">
                      <p className={`text-senior-base font-bold ${e.is_completed ? "line-through text-gray-400" : ""}`}>
                        {e.title}
                      </p>
                      <p className="text-senior-sm text-gray-500">{formatTime(e.scheduled_at)}</p>
                    </div>
                    {e.is_completed && <span className="text-2xl">✅</span>}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </SeniorShell>
  );
}
