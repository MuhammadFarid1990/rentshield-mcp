import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GuardianShell } from "@/components/layout/GuardianShell";

export default async function GuardianSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userRecord } = await supabase.from("users").select("*").eq("id", user.id).single();
  const { data: prefs } = await supabase.from("notification_preferences").select("*").eq("user_id", user.id).single();

  return (
    <GuardianShell title="Settings">
      <div className="flex flex-col gap-6 max-w-xl">
        <section className="bg-white border-2 border-gray-200 rounded-2xl p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Account</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-gray-500">Name</dt><dd className="font-semibold">{userRecord?.full_name}</dd>
            <dt className="text-gray-500">Email</dt><dd>{userRecord?.email}</dd>
            <dt className="text-gray-500">Role</dt><dd className="capitalize">{userRecord?.role}</dd>
            <dt className="text-gray-500">Timezone</dt><dd>{userRecord?.timezone}</dd>
          </dl>
        </section>

        <section className="bg-white border-2 border-gray-200 rounded-2xl p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Notification Preferences</h2>
          <ul className="text-sm divide-y divide-gray-100">
            {[
              { key: "email_alerts", label: "Email alerts" },
              { key: "sms_alerts", label: "SMS alerts" },
              { key: "missed_med", label: "Missed medication" },
              { key: "health_out_range", label: "Health reading out of range" },
              { key: "emergency", label: "Emergency alerts" },
              { key: "daily_summary", label: "Daily summary" },
              { key: "weekly_report", label: "Weekly report" },
            ].map((row) => (
              <li key={row.key} className="py-2 flex justify-between">
                <span>{row.label}</span>
                <span className={`font-semibold ${(prefs as Record<string, boolean> | null)?.[row.key] ? "text-green-700" : "text-gray-400"}`}>
                  {(prefs as Record<string, boolean> | null)?.[row.key] ? "On" : "Off"}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            Notification editing is currently read-only in the MVP. To change preferences, update directly in the database.
          </p>
        </section>

        <form action="/logout" method="POST">
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold">
            Sign Out
          </button>
        </form>
      </div>
    </GuardianShell>
  );
}
