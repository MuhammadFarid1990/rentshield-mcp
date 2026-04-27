import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ count: usersCount }, { count: seniorsCount }, { count: guardiansCount }, { count: staffCount }, { count: centersCount }, { count: alertsCount }] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("seniors").select("id", { count: "exact", head: true }),
    supabase.from("guardians").select("id", { count: "exact", head: true }),
    supabase.from("staff").select("id", { count: "exact", head: true }),
    supabase.from("care_centers").select("id", { count: "exact", head: true }),
    supabase.from("risk_alerts").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  const stats = [
    { label: "Total Users", value: usersCount ?? 0, color: "bg-blue-50 text-blue-800 border-blue-200" },
    { label: "Seniors", value: seniorsCount ?? 0, color: "bg-teal-50 text-teal-800 border-teal-200" },
    { label: "Guardians", value: guardiansCount ?? 0, color: "bg-purple-50 text-purple-800 border-purple-200" },
    { label: "Staff", value: staffCount ?? 0, color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
    { label: "Care Centers", value: centersCount ?? 0, color: "bg-amber-50 text-amber-800 border-amber-200" },
    { label: "Open Alerts", value: alertsCount ?? 0, color: "bg-red-50 text-red-800 border-red-200" },
  ];

  return (
    <AdminShell title="Admin Dashboard">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className={`border-2 rounded-2xl p-5 ${s.color}`}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
