import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { format, parseISO } from "date-fns";

export default async function AdminAuditLogsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*, actor:users(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AdminShell title="Audit Logs">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-gray-900">Audit Logs (last 200)</h2>

        <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">When</th>
                <th className="px-4 py-3 text-left">Actor</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Target Senior</th>
                <th className="px-4 py-3 text-left">Payload</th>
              </tr>
            </thead>
            <tbody>
              {(logs ?? []).map((l) => (
                <tr key={l.id} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{format(parseISO(l.created_at), "MMM d, HH:mm:ss")}</td>
                  <td className="px-4 py-2">{(l.actor as { full_name: string } | null)?.full_name ?? "system"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{l.action}</td>
                  <td className="px-4 py-2 font-mono text-xs">{l.target_senior_id?.slice(0, 8) ?? "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500 max-w-md truncate">
                    {l.payload ? JSON.stringify(l.payload) : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
