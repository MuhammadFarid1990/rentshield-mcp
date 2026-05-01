import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CenterShell } from "@/components/layout/CenterShell";
import { ActivityForm } from "@/components/center/ActivityForm";
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
          <ActivityForm careCenterId={staff.care_center_id} />
        </div>

        {(activities ?? []).length === 0 ? (
          <p className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center text-gray-500">
            No upcoming activities scheduled. Use the button above to add one.
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
                  {(a.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(a.tags as string[]).map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CenterShell>
  );
}
