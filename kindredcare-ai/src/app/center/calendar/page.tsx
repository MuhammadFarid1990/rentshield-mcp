import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CenterShell } from "@/components/layout/CenterShell";
import { CALENDAR_EVENT_TYPES } from "@/lib/constants";
import { format, parseISO, startOfDay, endOfDay, addDays } from "date-fns";

export default async function CenterCalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staff } = await supabase.from("staff").select("care_center_id").eq("user_id", user.id).single();
  if (!staff) redirect("/login");

  const { data: links } = await supabase
    .from("senior_center_links")
    .select("senior:seniors(id, preferred_name, user:users(full_name))")
    .eq("care_center_id", staff.care_center_id)
    .eq("status", "active");

  type LinkSenior = { id: string; preferred_name?: string | null; user?: { full_name?: string | null } | { full_name?: string | null }[] };
  const linkSeniors = (links ?? [])
    .map((l) => {
      const v = l.senior as unknown as LinkSenior | LinkSenior[] | null;
      return Array.isArray(v) ? v[0] : v;
    })
    .filter((s): s is LinkSenior => !!s && !!s.id);
  const seniorIds = linkSeniors.map((s) => s.id);
  const seniorMap: Record<string, string> = Object.fromEntries(
    linkSeniors.map((s) => {
      const u = Array.isArray(s.user) ? s.user[0] : s.user;
      return [s.id, s.preferred_name ?? u?.full_name ?? "Senior"];
    }),
  );

  const today = new Date();
  const { data: events } = seniorIds.length
    ? await supabase
        .from("calendar_events")
        .select("*")
        .in("senior_id", seniorIds)
        .gte("scheduled_at", startOfDay(today).toISOString())
        .lte("scheduled_at", endOfDay(addDays(today, 7)).toISOString())
        .eq("is_cancelled", false)
        .order("scheduled_at")
    : { data: [] };

  return (
    <CenterShell title="Center Calendar">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-gray-900">All Senior Reminders — Next 7 Days</h2>
        {(events ?? []).length === 0 ? (
          <p className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center text-gray-500">No upcoming events.</p>
        ) : (
          <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Senior</th>
                  <th className="px-3 py-2 text-left">Event</th>
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {(events ?? []).map((e) => {
                  const t = CALENDAR_EVENT_TYPES.find((x) => x.value === e.event_type);
                  return (
                    <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{seniorMap[e.senior_id]}</td>
                      <td className="px-3 py-2">{t?.icon} {e.title}</td>
                      <td className="px-3 py-2 text-gray-600">{format(parseISO(e.scheduled_at), "EEE MMM d, h:mm a")}</td>
                      <td className="px-3 py-2">
                        {e.is_completed ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">DONE</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">PENDING</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CenterShell>
  );
}
