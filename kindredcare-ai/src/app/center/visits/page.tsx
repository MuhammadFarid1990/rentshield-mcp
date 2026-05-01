import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CenterShell } from "@/components/layout/CenterShell";
import { format, parseISO } from "date-fns";

export default async function CenterVisitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staff } = await supabase.from("staff").select("care_center_id").eq("user_id", user.id).single();
  if (!staff) redirect("/login");

  const { data: visits } = await supabase
    .from("visit_requests")
    .select("*, senior:seniors(preferred_name, user:users(full_name))")
    .eq("care_center_id", staff.care_center_id)
    .order("requested_date", { ascending: false })
    .limit(50);

  const pending = (visits ?? []).filter((v) => v.status === "pending");
  const others = (visits ?? []).filter((v) => v.status !== "pending");

  return (
    <CenterShell title="Visit Requests">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-gray-900">Visit Requests</h2>

        <section>
          <h3 className="font-bold text-lg mb-3">Pending ({pending.length})</h3>
          {pending.length === 0 ? (
            <p className="text-gray-500 bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">No pending requests.</p>
          ) : (
            <div className="bg-white border-2 border-yellow-300 rounded-2xl divide-y divide-gray-100">
              {pending.map((v) => (
                <div key={v.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {(v.senior as { preferred_name?: string; user?: { full_name: string } })?.preferred_name ??
                       (v.senior as { user?: { full_name: string } })?.user?.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(v.requested_date + "T00:00:00"), "EEE, MMM d, yyyy")}
                      {v.preferred_time && ` at ${v.preferred_time}`}
                    </p>
                    {v.reason && <p className="text-sm text-gray-500 mt-1 italic">{v.reason}</p>}
                  </div>
                  <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">PENDING</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="font-bold text-lg mb-3">History</h3>
          {others.length === 0 ? (
            <p className="text-gray-500 bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">No past visits.</p>
          ) : (
            <div className="bg-white border-2 border-gray-200 rounded-2xl divide-y divide-gray-100">
              {others.map((v) => (
                <div key={v.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {(v.senior as { preferred_name?: string; user?: { full_name: string } })?.preferred_name ??
                       (v.senior as { user?: { full_name: string } })?.user?.full_name}
                    </p>
                    <p className="text-sm text-gray-500">{format(parseISO(v.requested_date + "T00:00:00"), "MMM d, yyyy")}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    v.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                    v.status === "completed" ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {v.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </CenterShell>
  );
}
