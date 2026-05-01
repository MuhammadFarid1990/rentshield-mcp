import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GuardianShell } from "@/components/layout/GuardianShell";
import { MedForm } from "@/components/medication/MedForm";
import { MedRow } from "@/components/medication/MedRow";
import type { MedicationSchedule, Senior, User } from "@/types/domain";

export default async function GuardianMedicationPage({ searchParams }: { searchParams: Promise<{ seniorId?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: guardian } = await supabase.from("guardians").select("id").eq("user_id", user.id).single();
  if (!guardian) redirect("/login");

  const { data: links } = await supabase
    .from("senior_guardian_links")
    .select("senior:seniors(*, user:users(full_name))")
    .eq("guardian_id", guardian.id);

  const seniors = (links ?? []).map((l) => l.senior as unknown as Senior & { user: User });
  const params = await searchParams;
  const selectedId = params.seniorId ?? seniors[0]?.id;

  const [{ data: meds }, { data: logs }] = selectedId ? await Promise.all([
    supabase.from("medication_schedules").select("*").eq("senior_id", selectedId).order("med_name"),
    supabase.from("medication_logs").select("*").eq("senior_id", selectedId).order("scheduled_time", { ascending: false }).limit(20),
  ]) : [{ data: [] }, { data: [] }];

  return (
    <GuardianShell title="Medication Management">
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

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Schedules</h2>
          {(meds ?? []).length === 0 ? (
            <p className="text-gray-500 bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">No medications on file.</p>
          ) : (
            <div className="bg-white border-2 border-gray-200 rounded-2xl divide-y divide-gray-100">
              {((meds ?? []) as MedicationSchedule[]).map((m) => (
                <MedRow key={m.id} med={m} />
              ))}
            </div>
          )}
        </section>

        {selectedId && (
          <section>
            <MedForm seniorId={selectedId} />
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Recent Dose Log</h2>
          {(logs ?? []).length === 0 ? (
            <p className="text-gray-500 bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">No dose logs yet.</p>
          ) : (
            <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Medicine</th>
                    <th className="px-3 py-2 text-left">Scheduled</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {(logs ?? []).map((l) => (
                    <tr key={l.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-medium">{l.med_name}</td>
                      <td className="px-3 py-2 text-gray-600">{new Date(l.scheduled_time).toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          l.status === "taken" ? "bg-green-100 text-green-700"
                          : l.status === "missed" ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">{l.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-xs text-gray-500 text-center">
          KindredCare AI does not give medication advice. Always follow the doctor's instructions.
        </p>
      </div>
    </GuardianShell>
  );
}
