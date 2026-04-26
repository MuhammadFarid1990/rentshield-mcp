import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GuardianShell } from "@/components/layout/GuardianShell";
import { BPTrendChart, SugarTrendChart } from "@/components/health/HealthTrendChart";
import { format, parseISO } from "date-fns";
import type { Senior, User } from "@/types/domain";

export default async function GuardianHealthPage({ searchParams }: { searchParams: Promise<{ seniorId?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: guardian } = await supabase.from("guardians").select("id").eq("user_id", user.id).single();
  if (!guardian) redirect("/login");

  const { data: links } = await supabase
    .from("senior_guardian_links")
    .select("senior:seniors(*, user:users(full_name))")
    .eq("guardian_id", guardian.id);

  const seniors = (links ?? []).map((l) => l.senior as Senior & { user: User });
  const params = await searchParams;
  const selectedId = params.seniorId ?? seniors[0]?.id;

  const [{ data: bp }, { data: sugar }, { data: vitals }, { data: checkins }] = selectedId ? await Promise.all([
    supabase.from("blood_pressure_records").select("*").eq("senior_id", selectedId).order("recorded_at", { ascending: false }).limit(20),
    supabase.from("blood_sugar_records").select("*").eq("senior_id", selectedId).order("recorded_at", { ascending: false }).limit(20),
    supabase.from("health_check_records").select("*").eq("senior_id", selectedId).order("recorded_at", { ascending: false }).limit(10),
    supabase.from("wellness_checkins").select("*").eq("senior_id", selectedId).order("checked_in_at", { ascending: false }).limit(10),
  ]) : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  return (
    <GuardianShell title="Health Records">
      <div className="flex flex-col gap-6">
        {seniors.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {seniors.map((s) => (
              <a key={s.id} href={`?seniorId=${s.id}`} className={`px-4 py-2 rounded-xl font-semibold ${s.id === selectedId ? "bg-teal-700 text-white" : "bg-white border-2 border-gray-200 text-gray-700"}`}>
                {s.preferred_name ?? s.user?.full_name}
              </a>
            ))}
          </div>
        )}

        <section className="bg-white border-2 border-gray-200 rounded-2xl p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Blood Pressure Trend (last 20)</h2>
          <BPTrendChart data={bp ?? []} />
        </section>

        <section className="bg-white border-2 border-gray-200 rounded-2xl p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Blood Sugar Trend (last 20)</h2>
          <SugarTrendChart data={sugar ?? []} />
        </section>

        <section className="bg-white border-2 border-gray-200 rounded-2xl p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Recent Wellness Check-ins</h2>
          {(checkins ?? []).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No check-ins yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {(checkins ?? []).map((c) => (
                <li key={c.id} className="py-2 flex justify-between">
                  <span>
                    Mood: <strong>{c.mood ?? "—"}</strong>, Sleep: <strong>{c.sleep_quality ?? "—"}</strong>
                  </span>
                  <span className="text-gray-500 text-sm">{format(parseISO(c.checked_in_at), "MMM d, h:mm a")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-xs text-gray-500 text-center">
          KindredCare AI is not a doctor. These charts are for informational purposes only.
        </p>
      </div>
    </GuardianShell>
  );
}
