import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GuardianShell } from "@/components/layout/GuardianShell";
import { DoctorRow, DoctorForm } from "@/components/contacts/DoctorCRUD";
import { EmergencyContactRow, EmergencyContactForm } from "@/components/contacts/EmergencyContactCRUD";
import type { Doctor, EmergencyContact, Senior, User } from "@/types/domain";

export default async function GuardianContactsPage({ searchParams }: { searchParams: Promise<{ seniorId?: string }> }) {
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

  const [{ data: doctors }, { data: contacts }] = selectedId
    ? await Promise.all([
        supabase.from("doctors").select("*").eq("senior_id", selectedId).order("is_primary", { ascending: false }).order("full_name"),
        supabase.from("emergency_contacts").select("*").eq("senior_id", selectedId).order("is_primary", { ascending: false }).order("sort_order"),
      ])
    : [{ data: [] }, { data: [] }];

  return (
    <GuardianShell title="Contacts">
      <div className="flex flex-col gap-6">
        {seniors.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {seniors.map((s) => (
              <a key={s.id} href={`?seniorId=${s.id}`}
                className={`px-4 py-2 rounded-xl font-semibold ${s.id === selectedId ? "bg-teal-700 text-white" : "bg-white border-2 border-gray-200 text-gray-700"}`}>
                {s.preferred_name ?? s.user?.full_name}
              </a>
            ))}
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Emergency Contacts</h2>
          <p className="text-sm text-gray-500 mb-3">These appear on the senior's help screen and offline card.</p>
          {(contacts ?? []).length === 0 ? (
            <p className="text-gray-500 bg-white border-2 border-gray-200 rounded-2xl p-6 text-center mb-3">
              No emergency contacts on file.
            </p>
          ) : (
            <div className="bg-white border-2 border-gray-200 rounded-2xl divide-y divide-gray-100 mb-3">
              {((contacts ?? []) as EmergencyContact[]).map((c) => (
                <EmergencyContactRow key={c.id} contact={c} />
              ))}
            </div>
          )}
          {selectedId && <EmergencyContactForm seniorId={selectedId} />}
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Doctors</h2>
          <p className="text-sm text-gray-500 mb-3">Used by the AI assistant to ground medication and appointment information.</p>
          {(doctors ?? []).length === 0 ? (
            <p className="text-gray-500 bg-white border-2 border-gray-200 rounded-2xl p-6 text-center mb-3">
              No doctors on file.
            </p>
          ) : (
            <div className="bg-white border-2 border-gray-200 rounded-2xl divide-y divide-gray-100 mb-3">
              {((doctors ?? []) as Doctor[]).map((d) => (
                <DoctorRow key={d.id} doctor={d} />
              ))}
            </div>
          )}
          {selectedId && <DoctorForm seniorId={selectedId} />}
        </section>

        {seniors.length === 0 && (
          <p className="text-gray-500 bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
            No seniors linked to your account yet.
          </p>
        )}
      </div>
    </GuardianShell>
  );
}
