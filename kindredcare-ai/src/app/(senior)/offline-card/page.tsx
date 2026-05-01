import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SeniorShell } from "@/components/layout/SeniorShell";

export const dynamic = "force-dynamic";

export default async function OfflineCardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: senior } = await supabase
    .from("seniors")
    .select("id, allergies, mobility_notes, diet_notes, user:users(full_name)")
    .eq("user_id", user.id)
    .single();
  if (!senior) redirect("/home");

  const [{ data: contacts }, { data: doctors }, { data: meds }, { data: centerLink }] = await Promise.all([
    supabase.from("emergency_contacts").select("*").eq("senior_id", senior.id).order("sort_order"),
    supabase.from("doctors").select("*").eq("senior_id", senior.id).limit(5),
    supabase.from("medication_schedules").select("med_name, dosage").eq("senior_id", senior.id).eq("is_active", true),
    supabase
      .from("senior_center_links")
      .select("care_centers(name, phone)")
      .eq("senior_id", senior.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle(),
  ]);

  const centerCenters = (centerLink as { care_centers?: { name?: string | null; phone?: string | null } | { name?: string | null; phone?: string | null }[] } | null)?.care_centers;
  const center = Array.isArray(centerCenters) ? centerCenters[0] : centerCenters;

  return (
    <SeniorShell title="Emergency Card" showBack backHref="/home">
      <div className="px-4 py-4 flex flex-col gap-5 print:p-2">
        <div className="bg-red-50 border-4 border-red-500 rounded-2xl p-5">
          <p className="text-senior-2xl font-bold text-red-800 text-center">EMERGENCY CARD</p>
          <p className="text-senior-base text-red-700 text-center mt-1">In case of emergency, call 911</p>
        </div>

        <Card
          title="Name"
          value={
            (Array.isArray(senior.user)
              ? (senior.user as { full_name?: string | null }[])[0]?.full_name
              : (senior.user as { full_name?: string | null } | null)?.full_name) ?? "—"
          }
        />
        {senior.allergies && <Card title="Allergies" value={senior.allergies} highlight />}
        {senior.mobility_notes && <Card title="Mobility Notes" value={senior.mobility_notes} />}
        {senior.diet_notes && <Card title="Diet Notes" value={senior.diet_notes} />}

        <section>
          <h2 className="text-senior-lg font-bold mb-2">Emergency Contacts</h2>
          <div className="flex flex-col gap-2">
            {(contacts ?? []).map((c) => (
              <Card key={c.id} title={`${c.full_name} (${c.relationship})`} value={c.phone} />
            ))}
            {(contacts ?? []).length === 0 && <p className="text-gray-500">None on file.</p>}
          </div>
        </section>

        <section>
          <h2 className="text-senior-lg font-bold mb-2">Doctors</h2>
          <div className="flex flex-col gap-2">
            {(doctors ?? []).map((d) => (
              <Card key={d.id} title={`Dr. ${d.full_name}${d.specialty ? ` (${d.specialty})` : ""}`} value={d.phone ?? "No phone on file"} />
            ))}
            {(doctors ?? []).length === 0 && <p className="text-gray-500">None on file.</p>}
          </div>
        </section>

        {center && (
          <Card title={`Care Center: ${center.name}`} value={center.phone ?? "No phone on file"} />
        )}

        <section>
          <h2 className="text-senior-lg font-bold mb-2">Active Medications</h2>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
            {(meds ?? []).length === 0 ? (
              <p className="text-gray-500">No active medications.</p>
            ) : (
              <ul className="list-disc list-inside text-senior-base text-gray-800">
                {(meds ?? []).map((m, i) => <li key={i}>{m.med_name} — {m.dosage}</li>)}
              </ul>
            )}
          </div>
        </section>

        <button onClick={() => typeof window !== "undefined" && window.print()} className="bg-gray-700 text-white py-3 rounded-xl font-bold print:hidden">
          🖨️ Print Card
        </button>

        <p className="text-xs text-gray-500 text-center print:text-black">
          KindredCare AI is not a doctor and is not for medical diagnosis. Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </SeniorShell>
  );
}

function Card({ title, value, highlight }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div className={`border-2 rounded-2xl p-3 ${highlight ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white"}`}>
      <p className="text-sm font-semibold text-gray-500 uppercase">{title}</p>
      <p className="text-senior-base text-gray-900">{value}</p>
    </div>
  );
}
