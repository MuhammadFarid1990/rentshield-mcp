import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CenterShell } from "@/components/layout/CenterShell";
import { format, parseISO } from "date-fns";

const severityStyles: Record<string, string> = {
  critical: "bg-red-50 border-red-500",
  high: "bg-orange-50 border-orange-400",
  medium: "bg-yellow-50 border-yellow-400",
  low: "bg-blue-50 border-blue-300",
};

export default async function CenterAlertsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staff } = await supabase.from("staff").select("care_center_id").eq("user_id", user.id).single();
  if (!staff) redirect("/login");

  const { data: links } = await supabase.from("senior_center_links").select("senior_id").eq("care_center_id", staff.care_center_id);
  const seniorIds = (links ?? []).map((l) => l.senior_id);

  const { data: alerts } = seniorIds.length
    ? await supabase
        .from("risk_alerts")
        .select("*, senior:seniors(preferred_name, user:users(full_name))")
        .in("senior_id", seniorIds)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <CenterShell title="Risk Alerts">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Risk Alerts</h2>

        {(alerts ?? []).length === 0 && (
          <p className="text-center bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-green-800 font-semibold">
            🌟 No alerts in your center.
          </p>
        )}

        {(alerts ?? []).map((a) => (
          <div key={a.id} className={`rounded-2xl border-2 p-5 ${severityStyles[a.severity] ?? "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-bold">{a.title}</p>
                <p className="text-sm mt-1">{a.description}</p>
                <p className="text-xs mt-2 text-gray-600">
                  {(a.senior as { preferred_name?: string; user?: { full_name: string } })?.preferred_name ??
                   (a.senior as { user?: { full_name: string } })?.user?.full_name} ·
                  {format(parseISO(a.created_at), " MMM d, h:mm a")} · {a.category}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-bold uppercase px-2 py-1 bg-white/60 rounded">{a.severity}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  a.status === "open" ? "bg-red-100 text-red-700" :
                  a.status === "acknowledged" ? "bg-yellow-100 text-yellow-800" :
                  "bg-green-100 text-green-700"
                }`}>{a.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CenterShell>
  );
}
