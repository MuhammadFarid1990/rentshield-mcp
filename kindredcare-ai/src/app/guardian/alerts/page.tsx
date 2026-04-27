import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GuardianShell } from "@/components/layout/GuardianShell";
import { format, parseISO } from "date-fns";
import type { Senior, User, RiskAlert } from "@/types/domain";

const severityStyles: Record<string, string> = {
  critical: "bg-red-50 border-red-500 text-red-900",
  high: "bg-orange-50 border-orange-400 text-orange-900",
  medium: "bg-yellow-50 border-yellow-400 text-yellow-900",
  low: "bg-blue-50 border-blue-300 text-blue-900",
};

export default async function GuardianAlertsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: guardian } = await supabase.from("guardians").select("id").eq("user_id", user.id).single();
  if (!guardian) redirect("/login");

  const { data: links } = await supabase
    .from("senior_guardian_links")
    .select("senior:seniors(id, preferred_name, user:users(full_name))")
    .eq("guardian_id", guardian.id);

  const seniors = (links ?? []).map((l) => l.senior as unknown as Senior & { user: User });
  const seniorIds = seniors.map((s) => s.id);
  const seniorMap = Object.fromEntries(seniors.map((s) => [s.id, s.preferred_name ?? s.user?.full_name]));

  const { data: alerts } = seniorIds.length
    ? await supabase
        .from("risk_alerts")
        .select("*")
        .in("senior_id", seniorIds)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  return (
    <GuardianShell title="Alerts">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Risk Alerts</h2>
          <p className="text-gray-500">Recent alerts about your loved one</p>
        </div>

        {(alerts ?? []).length === 0 && (
          <p className="text-center bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-green-800 font-semibold">
            🌟 No alerts — everything looks good!
          </p>
        )}

        {(alerts as RiskAlert[] ?? []).map((a) => (
          <div key={a.id} className={`rounded-2xl border-2 p-5 ${severityStyles[a.severity] ?? "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-bold text-lg">{a.title}</p>
                <p className="text-sm mt-1 opacity-90">{a.description}</p>
                <p className="text-xs mt-2 opacity-75">
                  {seniorMap[a.senior_id]} — {format(parseISO(a.created_at), "MMM d, h:mm a")} — {a.category}
                </p>
              </div>
              <span className="text-xs font-bold uppercase px-2 py-1 bg-white/60 rounded">{a.severity}</span>
            </div>
            <div className="mt-3 flex gap-2 text-sm font-semibold">
              <span className={`px-2 py-1 rounded-full ${a.status === "open" ? "bg-red-100 text-red-700" : a.status === "acknowledged" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-700"}`}>
                {a.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </GuardianShell>
  );
}
