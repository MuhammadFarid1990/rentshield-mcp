import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CenterShell } from "@/components/layout/CenterShell";
import { AttentionQueue } from "@/components/center/AttentionQueue";
import { RefreshStatusButton } from "@/components/center/RefreshStatusButton";
import type { DailyCareStatus, Senior, User } from "@/types/domain";
import Link from "next/link";

export default async function CenterMonitoringPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staffRecord } = await supabase
    .from("staff")
    .select("care_center_id, care_centers(name)")
    .eq("user_id", user.id)
    .single();

  if (!staffRecord) redirect("/login");

  const cc = staffRecord.care_centers as { name?: string | null } | { name?: string | null }[] | null;
  const centerName = (Array.isArray(cc) ? cc[0]?.name : cc?.name) ?? "Care Center";

  const { data: links } = await supabase
    .from("senior_center_links")
    .select("senior:seniors(*, user:users(full_name, email, phone))")
    .eq("care_center_id", staffRecord.care_center_id)
    .eq("status", "active");

  const seniors = (links ?? []).map((l) => l.senior as unknown as Senior & { user: User });
  const seniorIds = seniors.map((s) => s.id);

  const today = new Date().toISOString().slice(0, 10);
  const todayStart = `${today}T00:00:00.000Z`;
  const todayEnd = `${today}T23:59:59.999Z`;

  const [
    { data: statuses },
    { data: openAlerts },
    { data: pendingVisits },
    { data: pendingTransport },
    { data: todayMoods },
    { data: todayEvents },
  ] = seniorIds.length
    ? await Promise.all([
        supabase
          .from("daily_care_status")
          .select("*")
          .in("senior_id", seniorIds)
          .eq("status_date", today),
        supabase
          .from("risk_alerts")
          .select("id, senior_id, created_at")
          .in("senior_id", seniorIds)
          .in("status", ["open", "acknowledged"])
          .order("created_at", { ascending: false }),
        supabase
          .from("visit_requests")
          .select("id")
          .eq("care_center_id", staffRecord.care_center_id)
          .eq("status", "pending"),
        supabase
          .from("transportation_requests")
          .select("id")
          .in("senior_id", seniorIds)
          .eq("status", "pending"),
        supabase
          .from("wellness_checkins")
          .select("senior_id, mood, checked_in_at")
          .in("senior_id", seniorIds)
          .gte("checked_in_at", todayStart)
          .lte("checked_in_at", todayEnd)
          .order("checked_in_at", { ascending: false }),
        supabase
          .from("calendar_events")
          .select("senior_id, is_completed, is_cancelled")
          .in("senior_id", seniorIds)
          .eq("is_cancelled", false)
          .gte("scheduled_at", todayStart)
          .lte("scheduled_at", todayEnd),
      ])
    : [
        { data: [] }, { data: [] }, { data: [] },
        { data: [] }, { data: [] }, { data: [] },
      ];

  const statusMap = Object.fromEntries((statuses ?? []).map((s: DailyCareStatus) => [s.senior_id, s]));
  const alertMap: Record<string, string> = {};
  for (const a of (openAlerts ?? []) as { id: string; senior_id: string }[]) {
    if (!alertMap[a.senior_id]) alertMap[a.senior_id] = a.id;
  }

  // Last mood per senior (first entry is most recent due to descending order)
  const moodMap: Record<string, string | null> = {};
  for (const c of (todayMoods ?? []) as { senior_id: string; mood: string | null }[]) {
    if (!(c.senior_id in moodMap)) moodMap[c.senior_id] = c.mood;
  }

  // Completed reminders today per senior
  const completedMap: Record<string, number> = {};
  for (const e of (todayEvents ?? []) as { senior_id: string; is_completed: boolean }[]) {
    if (e.is_completed) completedMap[e.senior_id] = (completedMap[e.senior_id] ?? 0) + 1;
  }

  const rows = seniors.map((senior) => ({
    senior,
    openAlertId: alertMap[senior.id] ?? null,
    lastMood: moodMap[senior.id] ?? null,
    completedToday: completedMap[senior.id] ?? 0,
    status: statusMap[senior.id] ?? {
      id: "",
      senior_id: senior.id,
      status_date: today,
      overall_status: "green" as const,
      medicine_status: "green" as const,
      meal_status: "green" as const,
      hydration_status: "green" as const,
      mood_status: "green" as const,
      health_status: "green" as const,
      checkin_completed: false,
      missed_reminders_count: 0,
      open_alerts_count: 0,
    } satisfies DailyCareStatus,
  }));

  const red = rows.filter((r) => r.status.overall_status === "red").length;
  const yellow = rows.filter((r) => r.status.overall_status === "yellow").length;
  const pendingVisitCount = (pendingVisits ?? []).length;
  const pendingTransportCount = (pendingTransport ?? []).length;

  return (
    <CenterShell title={`${centerName} — Monitoring`}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Care Dashboard</h2>
            <p className="text-gray-500">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <RefreshStatusButton />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total Seniors",    value: seniors.length,      bg: "bg-blue-50 border-blue-200",     text: "text-blue-800" },
            { label: "Needs Follow-Up",  value: yellow,              bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-800" },
            { label: "Urgent",           value: red,                 bg: "bg-red-50 border-red-200",       text: "text-red-800" },
            { label: "Pending Visits",   value: pendingVisitCount,   bg: "bg-purple-50 border-purple-200", text: "text-purple-800" },
            { label: "Pending Transport",value: pendingTransportCount,bg:"bg-teal-50 border-teal-200",      text: "text-teal-800" },
          ].map(({ label, value, bg, text }) => (
            <div key={label} className={`border-2 rounded-2xl p-4 text-center ${bg}`}>
              <p className={`text-3xl font-bold ${text}`}>{value}</p>
              <p className={`text-xs font-medium ${text} mt-1`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/center/attention",      label: "Who Needs Attention?", emoji: "🚨" },
            { href: "/center/activities",     label: "Activities",           emoji: "🎯" },
            { href: "/center/visits",         label: "Visit Requests",       emoji: "📅" },
            { href: "/center/transportation", label: "Transportation",        emoji: "🚗" },
            { href: "/center/reports",        label: "Weekly Reports",       emoji: "📊" },
          ].map(({ href, label, emoji }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:border-indigo-400 text-gray-700 font-medium text-sm transition-colors"
            >
              {emoji} {label}
            </Link>
          ))}
        </div>

        {/* Attention queue */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Today&apos;s Senior Status</h3>
          <AttentionQueue rows={rows} />
        </section>
      </div>
    </CenterShell>
  );
}
