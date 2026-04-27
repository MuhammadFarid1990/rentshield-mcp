import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CenterShell } from "@/components/layout/CenterShell";
import Link from "next/link";
import type { Senior, User } from "@/types/domain";

export default async function CenterSeniorsListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staff } = await supabase.from("staff").select("care_center_id").eq("user_id", user.id).single();
  if (!staff) redirect("/login");

  const { data: links } = await supabase
    .from("senior_center_links")
    .select("*, senior:seniors(*, user:users(full_name, email))")
    .eq("care_center_id", staff.care_center_id);

  const seniors = (links ?? []).map((l) => ({
    senior: l.senior as unknown as Senior & { user: User },
    enrolledAt: l.enrolled_at,
    status: l.status,
  }));

  return (
    <CenterShell title="Seniors">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Seniors at Your Center</h2>
          <span className="text-sm text-gray-500">{seniors.length} total</span>
        </div>

        {seniors.length === 0 ? (
          <p className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center text-gray-500">
            No seniors enrolled yet.
          </p>
        ) : (
          <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Enrolled</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {seniors.map(({ senior, enrolledAt, status }) => (
                  <tr key={senior.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{senior.preferred_name ?? senior.user?.full_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        status === "active" ? "bg-green-100 text-green-700" : status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(enrolledAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/center/seniors/${senior.id}`} className="text-indigo-700 underline font-semibold">View</Link>
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
