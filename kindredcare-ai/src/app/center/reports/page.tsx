import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CenterShell } from "@/components/layout/CenterShell";
import { format, parseISO } from "date-fns";

export default async function CenterReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staff } = await supabase.from("staff").select("care_center_id").eq("user_id", user.id).single();
  if (!staff) redirect("/login");

  const { data: links } = await supabase.from("senior_center_links").select("senior_id").eq("care_center_id", staff.care_center_id);
  const seniorIds = (links ?? []).map((l) => l.senior_id);

  const { data: reports } = seniorIds.length
    ? await supabase
        .from("weekly_progress_reports")
        .select("*, senior:seniors(preferred_name, user:users(full_name))")
        .in("senior_id", seniorIds)
        .order("week_start", { ascending: false })
        .limit(30)
    : { data: [] };

  return (
    <CenterShell title="Weekly Reports">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-gray-900">Weekly Progress Reports</h2>

        {(reports ?? []).length === 0 ? (
          <p className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center text-gray-500">
            No reports generated yet. Reports run weekly via the Supabase edge function.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {(reports ?? []).map((r) => (
              <div key={r.id} className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold">
                    {(r.senior as { preferred_name?: string; user?: { full_name: string } })?.preferred_name ??
                     (r.senior as { user?: { full_name: string } })?.user?.full_name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {format(parseISO(r.week_start), "MMM d")} – {format(parseISO(r.week_end), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <Stat label="Med Compliance" value={`${r.med_compliance_pct ?? 0}%`} />
                  <Stat label="Missed Reminders" value={r.missed_reminders_count} />
                  <Stat label="Wellness Check-ins" value={r.wellness_checkins_count ?? 0} />
                  <Stat label="BP Logs" value={r.bp_logs_count} />
                  <Stat label="Sugar Logs" value={r.sugar_logs_count ?? 0} />
                  <Stat label="Loneliness" value={r.loneliness_logs_count} />
                </div>
                {r.ai_summary && (
                  <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-r-xl p-3 text-sm text-indigo-900">
                    <p className="font-semibold mb-1">AI Summary</p>
                    <p>{r.ai_summary}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </CenterShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
