import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CenterShell } from "@/components/layout/CenterShell";
import { format, parseISO } from "date-fns";

export default async function CenterTransportationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staff } = await supabase.from("staff").select("care_center_id").eq("user_id", user.id).single();
  if (!staff) redirect("/login");

  const { data: links } = await supabase.from("senior_center_links").select("senior_id").eq("care_center_id", staff.care_center_id);
  const seniorIds = (links ?? []).map((l) => l.senior_id);

  const { data: requests } = seniorIds.length
    ? await supabase
        .from("transportation_requests")
        .select("*, senior:seniors(preferred_name, user:users(full_name))")
        .in("senior_id", seniorIds)
        .order("pickup_at", { ascending: false })
        .limit(50)
    : { data: [] };

  return (
    <CenterShell title="Transportation">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-gray-900">Transportation Schedule</h2>
        {(requests ?? []).length === 0 ? (
          <p className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center text-gray-500">
            No transportation requests yet.
          </p>
        ) : (
          <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Senior</th>
                  <th className="px-4 py-3 text-left">Pickup</th>
                  <th className="px-4 py-3 text-left">Purpose</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {(requests ?? []).map((r) => (
                  <tr key={r.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">
                      {(r.senior as { preferred_name?: string; user?: { full_name: string } })?.preferred_name ??
                       (r.senior as { user?: { full_name: string } })?.user?.full_name}
                    </td>
                    <td className="px-4 py-3">{format(parseISO(r.pickup_at), "MMM d, h:mm a")}</td>
                    <td className="px-4 py-3 text-gray-600">{r.purpose ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        r.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        r.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                        r.status === "en_route" ? "bg-purple-100 text-purple-700" :
                        r.status === "completed" ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CenterShell>
  );
}
