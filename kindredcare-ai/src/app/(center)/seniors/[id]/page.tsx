import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { CenterShell } from "@/components/layout/CenterShell";
import { BPTrendChart, SugarTrendChart } from "@/components/health/HealthTrendChart";
import { format, parseISO } from "date-fns";

export default async function CenterSeniorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const { data: senior } = await supabase
    .from("seniors")
    .select("*, user:users(full_name, email, phone)")
    .eq("id", id)
    .single();
  if (!senior) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const [{ data: status }, { data: bp }, { data: sugar }, { data: meds }, { data: alerts }, { data: notes }] = await Promise.all([
    supabase.from("daily_care_status").select("*").eq("senior_id", id).eq("status_date", today).single(),
    supabase.from("blood_pressure_records").select("*").eq("senior_id", id).order("recorded_at", { ascending: false }).limit(20),
    supabase.from("blood_sugar_records").select("*").eq("senior_id", id).order("recorded_at", { ascending: false }).limit(20),
    supabase.from("medication_schedules").select("*").eq("senior_id", id).eq("is_active", true),
    supabase.from("risk_alerts").select("*").eq("senior_id", id).in("status", ["open", "acknowledged"]).order("created_at", { ascending: false }),
    supabase.from("notes").select("*, author:users(full_name)").eq("senior_id", id).order("created_at", { ascending: false }).limit(10),
  ]);

  const name = senior.preferred_name ?? senior.user?.full_name;

  return (
    <CenterShell title={name}>
      <div className="flex flex-col gap-6">
        <header>
          <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
          <p className="text-gray-500">{senior.user?.email} · {senior.user?.phone ?? "no phone"}</p>
        </header>

        {status && (
          <section className={`rounded-2xl p-5 border-2 ${
            status.overall_status === "red" ? "bg-red-50 border-red-300" :
            status.overall_status === "yellow" ? "bg-yellow-50 border-yellow-300" : "bg-green-50 border-green-300"
          }`}>
            <p className="font-bold text-lg">Today's Status: {status.overall_status.toUpperCase()}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 text-sm">
              <span>Medicine: {status.medicine_status}</span>
              <span>Meals: {status.meal_status}</span>
              <span>Hydration: {status.hydration_status}</span>
              <span>Mood: {status.mood_status}</span>
              <span>Health: {status.health_status}</span>
              <span>Missed: {status.missed_reminders_count}</span>
            </div>
          </section>
        )}

        <section className="bg-white border-2 border-gray-200 rounded-2xl p-5">
          <h3 className="font-bold text-lg mb-3">Profile</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-gray-500">Age</dt><dd>{senior.age ?? "—"}</dd>
            <dt className="text-gray-500">Language</dt><dd>{senior.primary_language}</dd>
            <dt className="text-gray-500">Allergies</dt><dd>{senior.allergies ?? "—"}</dd>
            <dt className="text-gray-500">Mobility</dt><dd>{senior.mobility_notes ?? "—"}</dd>
            <dt className="text-gray-500">Diet</dt><dd>{senior.diet_notes ?? "—"}</dd>
            <dt className="text-gray-500">Transportation</dt><dd>{senior.transportation_needs ?? "—"}</dd>
          </dl>
        </section>

        <section className="bg-white border-2 border-gray-200 rounded-2xl p-5">
          <h3 className="font-bold text-lg mb-3">Active Medications</h3>
          {(meds ?? []).length === 0 ? (
            <p className="text-gray-500 text-sm">No active medications.</p>
          ) : (
            <ul className="text-sm divide-y divide-gray-100">
              {(meds ?? []).map((m) => (
                <li key={m.id} className="py-2 flex justify-between">
                  <span>💊 <strong>{m.med_name}</strong> {m.dosage} · {(m.times ?? []).join(", ")}</span>
                  <span className="text-gray-500 text-xs">{m.frequency}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-3">Blood Pressure</h3>
            <BPTrendChart data={bp ?? []} />
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-3">Blood Sugar</h3>
            <SugarTrendChart data={sugar ?? []} />
          </div>
        </section>

        <section className="bg-white border-2 border-gray-200 rounded-2xl p-5">
          <h3 className="font-bold text-lg mb-3">Open Alerts</h3>
          {(alerts ?? []).length === 0 ? (
            <p className="text-gray-500 text-sm">No open alerts.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {(alerts ?? []).map((a) => (
                <li key={a.id} className="py-3">
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-gray-600">{a.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{format(parseISO(a.created_at), "MMM d, h:mm a")} · {a.severity}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white border-2 border-gray-200 rounded-2xl p-5">
          <h3 className="font-bold text-lg mb-3">Recent Staff Notes</h3>
          {(notes ?? []).length === 0 ? (
            <p className="text-gray-500 text-sm">No notes yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {(notes ?? []).map((n) => (
                <li key={n.id} className="py-3">
                  <p className="text-sm">{n.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {(n.author as { full_name: string })?.full_name} · {format(parseISO(n.created_at), "MMM d")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </CenterShell>
  );
}
