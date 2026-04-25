import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CenterShell } from "@/components/layout/CenterShell";
import { AttentionQueue } from "@/components/center/AttentionQueue";
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

  const centerName = (staffRecord.care_centers as { name: string } | null)?.name ?? "Care Center";

  const { data: links } = await supabase
    .from("senior_center_links")
    .select("senior:seniors(*, user:users(full_name, email))")
    .eq("care_center_id", staffRecord.care_center_id)
    .eq("status", "active");

  const seniors = (links ?? []).map((l) => l.senior as Senior & { user: User });

  const today = new Date().toISOString().slice(0, 10);
  const { data: statuses } = seniors.length
    ? await supabase
        .from("daily_care_status")
        .select("*")
        .in("senior_id", seniors.map((s) => s.id))
        .eq("status_date", today)
    : { data: [] };

  const statusMap = Object.fromEntries((statuses ?? []).map((s: DailyCareStatus) => [s.senior_id, s]));

  const rows = seniors.map((senior) => ({
    senior,
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

  return (
    <CenterShell title={`${centerName} — Monitoring`}>
      <div className="flex flex-col gap-6">
        {/* Summary header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Care Dashboard</h2>
          <p className="text-gray-500">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Seniors", value: seniors.length, bg: "bg-blue-50 border-blue-200", text: "text-blue-800" },
            { label: "Need Attention", value: yellow, bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-800" },
            { label: "Urgent", value: red, bg: "bg-red-50 border-red-200", text: "text-red-800" },
          ].map(({ label, value, bg, text }) => (
            <div key={label} className={`border-2 rounded-2xl p-4 text-center ${bg}`}>
              <p className={`text-3xl font-bold ${text}`}>{value}</p>
              <p className={`text-sm font-medium ${text} mt-1`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/center/attention", label: "Who Needs Attention?", emoji: "🚨" },
            { href: "/center/activities", label: "Activities", emoji: "🎯" },
            { href: "/center/visits", label: "Visit Requests", emoji: "📅" },
            { href: "/center/transportation", label: "Transportation", emoji: "🚗" },
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
          <h3 className="text-xl font-bold text-gray-800 mb-4">Today's Senior Status</h3>
          <AttentionQueue rows={rows} />
        </section>
      </div>
    </CenterShell>
  );
}
