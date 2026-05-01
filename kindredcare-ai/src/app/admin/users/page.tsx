import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = users ?? [];

  return (
    <AdminShell title="Users">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-gray-900">Users ({rows.length})</h2>

        {rows.length === 0 ? (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-3xl mb-2">👥</p>
            <p className="text-gray-600">No users yet.</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100">
                    <td className="px-4 py-2 font-medium">{u.full_name}</td>
                    <td className="px-4 py-2 text-gray-600">{u.email}</td>
                    <td className="px-4 py-2">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold capitalize">{u.role}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
