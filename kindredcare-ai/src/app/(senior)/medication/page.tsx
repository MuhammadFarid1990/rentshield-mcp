import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SeniorShell } from "@/components/layout/SeniorShell";
import type { MedicationSchedule } from "@/types/domain";

function MedCard({ med }: { med: MedicationSchedule }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-senior-lg font-bold text-gray-900">💊 {med.med_name}</p>
          <p className="text-senior-base text-gray-600">{med.dosage}{med.dosage_unit ? ` ${med.dosage_unit}` : ""}</p>
        </div>
        {med.is_active && (
          <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full flex-shrink-0">Active</span>
        )}
      </div>
      <p className="text-senior-sm text-gray-500">
        {med.frequency} at {med.times?.join(", ")}
      </p>
      {med.instructions && (
        <p className="text-senior-sm text-gray-600 bg-amber-50 rounded-xl px-3 py-2">{med.instructions}</p>
      )}
    </div>
  );
}

export default async function MedicationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: senior } = await supabase
    .from("seniors")
    .select("id, preferred_name, high_contrast")
    .eq("user_id", user.id)
    .single();

  if (!senior) redirect("/home");

  const { data: meds } = await supabase
    .from("medication_schedules")
    .select("*")
    .eq("senior_id", senior.id)
    .eq("is_active", true)
    .order("created_at");

  return (
    <SeniorShell title="My Medications" showBack backHref="/home" highContrast={senior.high_contrast}>
      <div className="px-4 py-4 flex flex-col gap-5">
        {meds?.length === 0 ? (
          <div className="text-center bg-white rounded-2xl p-8 border-2 border-gray-200">
            <p className="text-5xl mb-3">💊</p>
            <p className="text-senior-lg text-gray-600">No medications on file yet.</p>
            <p className="text-senior-sm text-gray-500 mt-2">Ask your guardian or care center to add your medications.</p>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
              <p className="text-senior-base text-blue-800">
                You have <strong>{meds?.length}</strong> active medication{meds?.length === 1 ? "" : "s"}.
                Say <em>"I took my medicine"</em> on the Talk screen to log a dose.
              </p>
            </div>
            {meds?.map((med) => <MedCard key={med.id} med={med} />)}
          </>
        )}

        <p className="text-sm text-gray-400 text-center px-2">
          KindredCare AI does not give medication advice. Always follow your doctor's instructions.
        </p>
      </div>
    </SeniorShell>
  );
}
