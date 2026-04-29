import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { CenterShell } from "@/components/layout/CenterShell";
import { BPTrendChart, SugarTrendChart } from "@/components/health/HealthTrendChart";
import { TodayRemindersList } from "@/components/center/TodayRemindersList";
import { MedicationLogList } from "@/components/center/MedicationLogList";
import { RecentVitalsList } from "@/components/center/RecentVitalsList";
import { WellnessCheckinList } from "@/components/center/WellnessCheckinList";
import { MoodTrendChart } from "@/components/center/MoodTrendChart";
import { GenerateWeeklySummaryButton } from "@/components/center/GenerateWeeklySummaryButton";
import { format, parseISO, subDays, startOfDay, endOfDay } from "date-fns";
import type { CalendarEvent, MedicationLog, BloodPressureRecord, BloodSugarRecord, WellnessCheckin } from "@/types/domain";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border-2 border-gray-200 rounded-2xl p-5">
      <h3 className="font-bold text-lg mb-3">{title}</h3>
      {children}
    </section>
  );
}

export default async function CenterSeniorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const { data: senior } = await supabase
    .from("seniors")
    .select("*, user:users(full_name, email, phone), timezone")
    .eq("id", id)
    .single();
  if (!senior) notFound();

  const tz = (senior.timezone as string | null) ?? "America/New_York";
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const sevenDaysAgo = startOfDay(subDays(now, 7)).toISOString();
  const fourteenDaysAgo = startOfDay(subDays(now, 14)).toISOString();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();

  const [
    { data: status },
    { data: bp },
    { data: sugar },
    { data: meds },
    { data: alerts },
    { data: notes },
    { data: todayEvents },
    { data: medLogs },
    { data: checkins14d },
    { data: lastWeekReport },
  ] = await Promise.all([
    supabase.from("daily_care_status").select("*").eq("senior_id", id).eq("status_date", today).maybeSingle(),
    supabase.from("blood_pressure_records").select("*").eq("senior_id", id).order("recorded_at", { ascending: false }).limit(20),
    supabase.from("blood_sugar_records").select("*").eq("senior_id", id).order("recorded_at", { ascending: false }).limit(20),
    supabase.from("medication_schedules").select("*").eq("senior_id", id).eq("is_active", true),
    supabase.from("risk_alerts").select("*").eq("senior_id", id).in("status", ["open", "acknowledged"]).order("created_at", { ascending: false }),
    supabase.from("notes").select("*, author:users(full_name)").eq("senior_id", id).order("created_at", { ascending: false }).limit(10),
    supabase.from("calendar_events").select("*").eq("senior_id", id).eq("is_cancelled", false).gte("scheduled_at", todayStart).lte("scheduled_at", todayEnd).order("scheduled_at"),
    supabase.from("medication_logs").select("*").eq("senior_id", id).gte("scheduled_time", sevenDaysAgo).order("scheduled_time", { ascending: false }).limit(50),
    supabase.from("wellness_checkins").select("*").eq("senior_id", id).gte("checked_in_at", fourteenDaysAgo).order("checked_in_at", { ascending: false }),
    supabase.from("weekly_progress_reports").select("ai_summary").eq("senior_id", id).order("week_start", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const name = senior.preferred_name ?? (senior.user as { full_name?: string } | null)?.full_name ?? "Senior";
  const checkins7d = (checkins14d ?? []).filter(
    (c: WellnessCheckin) => c.checked_in_at >= sevenDaysAgo,
  );

  return (
    <CenterShell title={name}>
      <div className="flex flex-col gap-6">
        <header>
          <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
          <p className="text-gray-500">
            {(senior.user as { email?: string } | null)?.email ?? ""}
            {(senior.user as { phone?: string | null } | null)?.phone ? ` · ${(senior.user as { phone: string }).phone}` : ""}
          </p>
        </header>

        {/* Today's overall status */}
        {status && (
          <section className={`rounded-2xl p-5 border-2 ${
            status.overall_status === "red" ? "bg-red-50 border-red-300" :
            status.overall_status === "yellow" ? "bg-yellow-50 border-yellow-300" : "bg-green-50 border-green-300"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-lg">Today&apos;s Status: {status.overall_status.toUpperCase()}</p>
              <p className="text-sm text-gray-500">
                {status.missed_reminders_count} missed · {status.open_alerts_count} alert{status.open_alerts_count !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {([
                ["Medicine", status.medicine_status],
                ["Meals",    status.meal_status],
                ["Hydration",status.hydration_status],
                ["Mood",     status.mood_status],
                ["Health",   status.health_status],
              ] as [string, "green"|"yellow"|"red"][]).map(([label, level]) => (
                <div key={label} className={`rounded-xl p-3 text-center border ${
                  level === "red" ? "bg-red-100 border-red-200 text-red-800" :
                  level === "yellow" ? "bg-yellow-100 border-yellow-200 text-yellow-800" :
                  "bg-green-100 border-green-200 text-green-800"
                }`}>
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-sm font-bold mt-0.5 capitalize">{level}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Today's reminders */}
        <SectionCard title="Today's Reminders">
          <TodayRemindersList events={(todayEvents ?? []) as CalendarEvent[]} timezone={tz} />
        </SectionCard>

        {/* Medication logs */}
        <SectionCard title="Medication Logs (Last 7 Days)">
          <MedicationLogList logs={(medLogs ?? []) as MedicationLog[]} />
        </SectionCard>

        {/* Active medications */}
        <SectionCard title="Active Medication Schedules">
          {(meds ?? []).length === 0 ? (
            <p className="text-gray-500 text-sm">No active medications.</p>
          ) : (
            <ul className="text-sm divide-y divide-gray-100">
              {(meds ?? []).map((m) => (
                <li key={m.id} className="py-2 flex justify-between">
                  <span>💊 <strong>{m.med_name}</strong> {m.dosage} · {(m.times ?? []).join(", ")}</span>
                  <span className="text-gray-500 text-xs">{m.frequency}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Recent vitals list */}
        <SectionCard title="Recent Vitals">
          <RecentVitalsList
            bp={(bp ?? []) as BloodPressureRecord[]}
            sugar={(sugar ?? []) as BloodSugarRecord[]}
          />
        </SectionCard>

        {/* Health trend charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-3">Blood Pressure Trend</h3>
            <BPTrendChart data={bp ?? []} />
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-3">Blood Sugar Trend</h3>
            <SugarTrendChart data={sugar ?? []} />
          </div>
        </section>

        {/* Wellness check-ins */}
        <SectionCard title="Wellness Check-ins (Last 7 Days)">
          <WellnessCheckinList checkins={checkins7d as WellnessCheckin[]} />
        </SectionCard>

        {/* Mood trend */}
        <SectionCard title="Mood Trend (Last 14 Days)">
          <MoodTrendChart checkins={(checkins14d ?? []) as WellnessCheckin[]} />
        </SectionCard>

        {/* Open alerts */}
        <SectionCard title="Open Alerts">
          {(alerts ?? []).length === 0 ? (
            <p className="text-gray-500 text-sm">No open alerts.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {(alerts ?? []).map((a) => (
                <li key={a.id} className="py-3">
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-gray-600">{a.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(parseISO(a.created_at), "MMM d, h:mm a")} · {a.severity}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Weekly AI summary */}
        <SectionCard title="Weekly AI Progress Summary">
          <GenerateWeeklySummaryButton
            seniorId={id}
            existingSummary={lastWeekReport?.ai_summary ?? null}
          />
        </SectionCard>

        {/* Profile */}
        <SectionCard title="Profile">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-gray-500">Age</dt><dd>{senior.age ?? "—"}</dd>
            <dt className="text-gray-500">Language</dt><dd>{senior.primary_language}</dd>
            <dt className="text-gray-500">Allergies</dt><dd>{senior.allergies ?? "—"}</dd>
            <dt className="text-gray-500">Mobility</dt><dd>{senior.mobility_notes ?? "—"}</dd>
            <dt className="text-gray-500">Diet</dt><dd>{senior.diet_notes ?? "—"}</dd>
            <dt className="text-gray-500">Transportation</dt><dd>{senior.transportation_needs ?? "—"}</dd>
          </dl>
        </SectionCard>

        {/* Staff notes */}
        <SectionCard title="Recent Staff Notes">
          {(notes ?? []).length === 0 ? (
            <p className="text-gray-500 text-sm">No notes yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {(notes ?? []).map((n) => (
                <li key={n.id} className="py-3">
                  <p className="text-sm">{n.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {(() => {
                      const author = Array.isArray(n.author) ? n.author[0] : n.author;
                      return (author as { full_name?: string | null } | null)?.full_name ?? "Staff";
                    })()} · {format(parseISO(n.created_at), "MMM d")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </CenterShell>
  );
}
