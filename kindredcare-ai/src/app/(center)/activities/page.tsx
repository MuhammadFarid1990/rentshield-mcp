import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CenterShell } from "@/components/layout/CenterShell";
import { format, parseISO } from "date-fns";
import { ACTIVITY_TYPES } from "@/lib/constants";

export default async function CenterActivitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staff } = await supabase.from("staff").select("care_center_id").eq("user_id", user.id).single();
  if (!staff) redirect("/login");

  const { data: activities } = await supabase
    .from("center_activities")
    .select("*")
    .eq("care_center_id", staff.care_center_id)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at")
    .limit(50);

  return (
    <CenterShell title="Activities & Events">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Activities</h2>
          <button className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-xl font-semibold">
            + New Activity
          </button>
        </div>

        {(activities ?? []).length === 0 ? (
          <p className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center text-gray-500">
            No upcoming activities scheduled.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(activities ?? []).map((a) => {
              const t = ACTIVITY_TYPES.find((x) => x.value === a.activity_type);
              return (
                <div key={a.id} className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <p className="font-bold text-lg">{a.title}</p>
                    {a.transportation_provided && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">🚗 Transport</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{t?.label ?? a.activity_type}</p>
                  <p className="text-sm font-semibold text-gray-700">{format(parseISO(a.scheduled_at), "EEE MMM d, h:mm a")}</p>
                  {a.location && <p className="text-sm text-gray-500">📍 {a.location}</p>}
                  {a.description && <p className="text-sm text-gray-600 mt-1">{a.description}</p>}
                  {a.max_participants && <p className="text-xs text-gray-500 mt-2">Max: {a.max_participants} participants</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CenterShell>
  );
}
