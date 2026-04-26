import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GuardianShell } from "@/components/layout/GuardianShell";
import { QuickAddRowGuardian } from "@/components/calendar/QuickAddRowGuardian";
import { CALENDAR_EVENT_TYPES } from "@/lib/constants";
import { format, parseISO, addDays, startOfDay, endOfDay } from "date-fns";
import type { Senior, User } from "@/types/domain";

export default async function GuardianCalendarPage({ searchParams }: { searchParams: Promise<{ seniorId?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: guardian } = await supabase.from("guardians").select("id").eq("user_id", user.id).single();
  if (!guardian) redirect("/login");

  const { data: links } = await supabase
    .from("senior_guardian_links")
    .select("senior:seniors(*, user:users(full_name))")
    .eq("guardian_id", guardian.id);

  const seniors = (links ?? []).map((l) => l.senior as Senior & { user: User });
  const params = await searchParams;
  const selectedSeniorId = params.seniorId ?? seniors[0]?.id;
  const selectedSenior = seniors.find((s) => s.id === selectedSeniorId);

  const { data: events } = selectedSeniorId
    ? await supabase
        .from("calendar_events")
        .select("*")
        .eq("senior_id", selectedSeniorId)
        .gte("scheduled_at", startOfDay(new Date()).toISOString())
        .lte("scheduled_at", endOfDay(addDays(new Date(), 7)).toISOString())
        .eq("is_cancelled", false)
        .order("scheduled_at")
    : { data: [] };

  return (
    <GuardianShell title="Calendar Management">
      <div className="flex flex-col gap-6">
        {seniors.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {seniors.map((s) => (
              <a
                key={s.id}
                href={`?seniorId=${s.id}`}
                className={`px-4 py-2 rounded-xl font-semibold ${
                  s.id === selectedSeniorId ? "bg-teal-700 text-white" : "bg-white border-2 border-gray-200 text-gray-700"
                }`}
              >
                {s.preferred_name ?? s.user?.full_name}
              </a>
            ))}
          </div>
        )}

        {selectedSenior && (
          <>
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Quick Add for {selectedSenior.preferred_name ?? selectedSenior.user?.full_name}
              </h2>
              <p className="text-gray-500 text-sm mb-3">Click once to confirm, click again to add.</p>
              <QuickAddRowGuardian seniorId={selectedSenior.id} />
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Next 7 Days</h2>
              {(events ?? []).length === 0 ? (
                <p className="text-gray-500 bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
                  No upcoming events. Use Quick Add above.
                </p>
              ) : (
                <div className="bg-white border-2 border-gray-200 rounded-2xl divide-y divide-gray-100">
                  {(events ?? []).map((e) => {
                    const t = CALENDAR_EVENT_TYPES.find((x) => x.value === e.event_type);
                    return (
                      <div key={e.id} className="p-4 flex items-center gap-4">
                        <span className="text-2xl">{t?.icon ?? "📝"}</span>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{e.title}</p>
                          <p className="text-sm text-gray-500">{format(parseISO(e.scheduled_at), "EEE MMM d, h:mm a")}</p>
                        </div>
                        {e.is_completed && <span className="text-green-600 text-xl">✅</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {seniors.length === 0 && (
          <p className="text-gray-500 bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
            No seniors linked to your account yet.
          </p>
        )}
      </div>
    </GuardianShell>
  );
}
