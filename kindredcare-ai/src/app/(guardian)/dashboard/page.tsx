import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GuardianShell } from "@/components/layout/GuardianShell";
import { StatusHero } from "@/components/guardian/StatusHero";
import type { Senior, User, DailyCareStatus } from "@/types/domain";
import Link from "next/link";

export default async function GuardianDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: guardian } = await supabase
    .from("guardians")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!guardian) redirect("/login");

  const { data: links } = await supabase
    .from("senior_guardian_links")
    .select("senior:seniors(*, user:users(full_name, email))")
    .eq("guardian_id", guardian.id);

  const seniors = (links ?? []).map((l) => l.senior as Senior & { user: User });

  // Fetch today's status for all seniors
  const today = new Date().toISOString().slice(0, 10);
  const seniorIds = seniors.map((s) => s.id);

  const { data: statuses } = seniorIds.length
    ? await supabase
        .from("daily_care_status")
        .select("*")
        .in("senior_id", seniorIds)
        .eq("status_date", today)
    : { data: [] };

  const statusMap = Object.fromEntries((statuses ?? []).map((s: DailyCareStatus) => [s.senior_id, s]));

  return (
    <GuardianShell title="Guardian Dashboard">
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Is my loved one okay today?</h2>
          <p className="text-gray-500">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>

        {seniors.length === 0 && (
          <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-gray-200">
            <p className="text-xl text-gray-600">No seniors linked to your account yet.</p>
            <p className="text-gray-400 mt-2">Ask the care center to link your loved one to your account.</p>
          </div>
        )}

        {seniors.map((senior) => (
          <section key={senior.id}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {senior.preferred_name ?? senior.user?.full_name}
              </h3>
              <Link
                href={`/guardian/health?seniorId=${senior.id}`}
                className="text-teal-700 underline font-semibold text-sm"
              >
                View Details →
              </Link>
            </div>
            <StatusHero
              status={statusMap[senior.id] ?? null}
              seniorName={senior.preferred_name ?? senior.user?.full_name ?? ""}
            />
          </section>
        ))}

        {/* Quick actions */}
        {seniors.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-gray-700 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/guardian/calendar", label: "Manage Calendar", emoji: "📅" },
                { href: "/guardian/medication", label: "Manage Medications", emoji: "💊" },
                { href: "/guardian/alerts", label: "View Alerts", emoji: "🔔" },
                { href: "/guardian/messages", label: "Send Message", emoji: "💬" },
              ].map(({ href, label, emoji }) => (
                <Link
                  key={href}
                  href={href}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-teal-400 hover:bg-teal-50 transition-colors text-center"
                >
                  <span className="text-3xl">{emoji}</span>
                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </GuardianShell>
  );
}
