import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function AdminCentersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: centers } = await supabase
    .from("care_centers")
    .select("*")
    .order("name");

  return (
    <AdminShell title="Care Centers">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Care Centers</h2>
          <button className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl font-semibold">+ New Center</button>
        </div>

        {(centers ?? []).length === 0 ? (
          <p className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center text-gray-500">No centers yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(centers ?? []).map((c) => (
              <div key={c.id} className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                <h3 className="font-bold text-lg">{c.name}</h3>
                <p className="text-sm text-gray-600">{c.address ?? "No address"}</p>
                <p className="text-sm text-gray-500">{c.phone ?? "No phone"} · {c.email ?? "No email"}</p>
                <p className="text-xs text-gray-400 mt-2">TZ: {c.timezone}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
