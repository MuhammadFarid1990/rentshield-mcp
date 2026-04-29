import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GuardianShell } from "@/components/layout/GuardianShell";
import { StatusHero } from "@/components/guardian/StatusHero";
import { SuggestedActionCard } from "@/components/guardian/SuggestedAction";
import { TodaySummaryCard, type TodaySummary } from "@/components/guardian/TodaySummaryCard";
import { RecentAlertsCard } from "@/components/guardian/RecentAlertsCard";
import { CareCenterNotesCard, type StaffNote } from "@/components/guardian/CareCenterNotesCard";
import { WeeklyProgressCard } from "@/components/guardian/WeeklyProgressCard";
import { suggestActionForGuardian } from "@/lib/care-status/suggest";
import type { Senior, User, DailyCareStatus, RiskAlert, WeeklyProgressReport } from "@/types/domain";
import Link from "next/link";
import { startOfDay, endOfDay } from "date-fns";

export default async function GuardianDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: guardian } = await supabase
    .from("guardians")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!guardian) redirect("/login");

  const { data: links } = await supabase
    .from("senior_guardian_links")
    .select("senior:seniors(*, user:users(full_name, email, phone))")
    .eq("guardian_id", guardian.id);

  const seniors = (links ?? []).map((l) => l.senior as unknown as Senior & { user: User & { phone?: string | null } });
  const seniorIds = seniors.map((s) => s.id);

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();

  const [
    { data: statuses },
    { data: alerts },
    { data: notes },
    { data: weeklyReports },
    { data: todayEvents },
    { data: todayMedLogs },
    { data: todayCheckins },
    { data: todayBP },
    { data: todaySugar },
  ] = seniorIds.length
    ? await Promise.all([
        supabase
          .from("daily_care_status")
          .select("*")
          .in("senior_id", seniorIds)
          .eq("status_date", today),
        supabase
          .from("risk_alerts")
          .select("*")
          .in("senior_id", seniorIds)
          .in("status", ["open", "acknowledged"])
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("notes")
          .select("id, senior_id, content, created_at, author:users(full_name)")
          .in("senior_id", seniorIds)
          .order("created_at", { ascending: false })
          .limit(15),
        supabase
          .from("weekly_progress_reports")
          .select("*")
          .in("senior_id", seniorIds)
          .order("week_start", { ascending: false }),
        supabase
          .from("calendar_events")
          .select("senior_id, event_type, is_completed, is_cancelled")
          .in("senior_id", seniorIds)
          .eq("is_cancelled", false)
          .gte("scheduled_at", todayStart)
          .lte("scheduled_at", todayEnd),
        supabase
          .from("medication_logs")
          .select("senior_id, status")
          .in("senior_id", seniorIds)
          .gte("scheduled_time", todayStart)
          .lte("scheduled_time", todayEnd),
        supabase
          .from("wellness_checkins")
          .select("senior_id, mood, checked_in_at")
          .in("senior_id", seniorIds)
          .gte("checked_in_at", todayStart)
          .lte("checked_in_at", todayEnd)
          .order("checked_in_at", { ascending: false }),
        supabase
          .from("blood_pressure_records")
          .select("senior_id, systolic, diastolic, recorded_at")
          .in("senior_id", seniorIds)
          .gte("recorded_at", todayStart)
          .lte("recorded_at", todayEnd)
          .order("recorded_at", { ascending: false }),
        supabase
          .from("blood_sugar_records")
          .select("senior_id, value, unit, recorded_at")
          .in("senior_id", seniorIds)
          .gte("recorded_at", todayStart)
          .lte("recorded_at", todayEnd)
          .order("recorded_at", { ascending: false }),
      ])
    : [
        { data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] },
        { data: [] }, { data: [] }, { data: [] }, { data: [] },
      ];

  const statusMap = Object.fromEntries((statuses ?? []).map((s: DailyCareStatus) => [s.senior_id, s]));

  // Group helpers — first occurrence wins for ordered queries (descending)
  const firstBy = <T extends { senior_id: string }>(rows: T[]): Record<string, T> => {
    const out: Record<string, T> = {};
    for (const r of rows) if (!(r.senior_id in out)) out[r.senior_id] = r;
    return out;
  };

  const groupBy = <T extends { senior_id: string }>(rows: T[]): Record<string, T[]> => {
    const out: Record<string, T[]> = {};
    for (const r of rows) (out[r.senior_id] ||= []).push(r);
    return out;
  };

  const eventsBySenior = groupBy((todayEvents ?? []) as { senior_id: string; event_type: string; is_completed: boolean }[]);
  const medLogsBySenior = groupBy((todayMedLogs ?? []) as { senior_id: string; status: string }[]);
  const lastCheckinBySenior = firstBy((todayCheckins ?? []) as { senior_id: string; mood: string | null; checked_in_at: string }[]);
  const lastBPBySenior = firstBy((todayBP ?? []) as { senior_id: string; systolic: number; diastolic: number; recorded_at: string }[]);
  const lastSugarBySenior = firstBy((todaySugar ?? []) as { senior_id: string; value: number; unit: string; recorded_at: string }[]);

  const alertsBySenior = groupBy((alerts ?? []) as RiskAlert[]);
  const notesBySenior = groupBy((notes ?? []) as (StaffNote & { senior_id: string })[]);
  const weeklyReportBySenior = firstBy((weeklyReports ?? []) as (WeeklyProgressReport & { senior_id: string })[]);

  function buildTodaySummary(seniorId: string): TodaySummary {
    const events = eventsBySenior[seniorId] ?? [];
    const meds = medLogsBySenior[seniorId] ?? [];
    const meals = events.filter((e) => e.event_type === "meal");
    const hyd = events.filter((e) => e.event_type === "hydration");
    const checkin = lastCheckinBySenior[seniorId];
    const bp = lastBPBySenior[seniorId];
    const sugar = lastSugarBySenior[seniorId];
    const status = statusMap[seniorId];

    return {
      medicine: {
        taken: meds.filter((m) => m.status === "taken").length,
        total: meds.length,
      },
      meals: { completed: meals.filter((e) => e.is_completed).length, total: meals.length },
      hydration: { completed: hyd.filter((e) => e.is_completed).length, total: hyd.length },
      wellnessCheckin: {
        mood: checkin?.mood ?? null,
        checkedInAt: checkin?.checked_in_at ?? null,
      },
      health: {
        bp: bp ? `${bp.systolic}/${bp.diastolic}` : null,
        sugar: sugar ? `${sugar.value} ${sugar.unit}` : null,
      },
      missedReminders: status?.missed_reminders_count ?? 0,
      openAlerts: status?.open_alerts_count ?? 0,
    };
  }

  return (
    <GuardianShell title="Guardian Dashboard">
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Is my loved one okay today?</h2>
          <p className="text-gray-500">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        {seniors.length === 0 && (
          <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-gray-200">
            <p className="text-xl text-gray-600">No seniors linked to your account yet.</p>
            <p className="text-gray-400 mt-2">Ask the care center to link your loved one to your account.</p>
          </div>
        )}

        {seniors.map((senior) => {
          const seniorName = senior.preferred_name ?? senior.user?.full_name ?? "Senior";
          const status = statusMap[senior.id] ?? null;
          const action = suggestActionForGuardian(status, seniorName, senior.id);
          const summary = buildTodaySummary(senior.id);
          const seniorAlerts = (alertsBySenior[senior.id] ?? []).slice(0, 3);
          const seniorNotes = (notesBySenior[senior.id] ?? []).slice(0, 5);
          const weeklyReport = weeklyReportBySenior[senior.id] ?? null;

          return (
            <section key={senior.id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xl font-bold text-gray-800">{seniorName}</h3>
                <Link
                  href={`/guardian/health?seniorId=${senior.id}`}
                  className="text-teal-700 underline font-semibold text-sm"
                >
                  View full health →
                </Link>
              </div>

              <StatusHero status={status} seniorName={seniorName} />

              <SuggestedActionCard
                action={action}
                seniorId={senior.id}
                seniorPhone={senior.user?.phone ?? null}
              />

              <TodaySummaryCard summary={summary} />

              <RecentAlertsCard alerts={seniorAlerts} />

              <CareCenterNotesCard notes={seniorNotes} />

              <WeeklyProgressCard seniorId={senior.id} report={weeklyReport} />
            </section>
          );
        })}

        {/* Quick actions */}
        {seniors.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-gray-700 mb-3">Manage</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/guardian/calendar",   label: "Manage Calendar",    emoji: "📅" },
                { href: "/guardian/medication", label: "Manage Medications", emoji: "💊" },
                { href: "/guardian/contacts",   label: "Contacts & Doctors", emoji: "📋" },
                { href: "/guardian/messages",   label: "Send Message",       emoji: "💬" },
              ].map(({ href, label, emoji }) => (
                <Link
                  key={href}
                  href={href}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-teal-400 hover:bg-teal-50 transition-colors text-center min-h-[88px] justify-center"
                >
                  <span className="text-3xl">{emoji}</span>
                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </GuardianShell>
  );
}
