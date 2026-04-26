import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SeniorShell } from "@/components/layout/SeniorShell";
import Link from "next/link";
import { format, parseISO } from "date-fns";

export default async function SeniorHealthPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: senior } = await supabase
    .from("seniors")
    .select("id, high_contrast")
    .eq("user_id", user.id)
    .single();
  if (!senior) redirect("/home");

  const [{ data: bp }, { data: sugar }, { data: vitals }] = await Promise.all([
    supabase.from("blood_pressure_records").select("*").eq("senior_id", senior.id).order("recorded_at", { ascending: false }).limit(5),
    supabase.from("blood_sugar_records").select("*").eq("senior_id", senior.id).order("recorded_at", { ascending: false }).limit(5),
    supabase.from("health_check_records").select("*").eq("senior_id", senior.id).order("recorded_at", { ascending: false }).limit(5),
  ]);

  return (
    <SeniorShell title="My Health" showBack backHref="/home" highContrast={senior.high_contrast}>
      <div className="px-4 py-4 flex flex-col gap-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <p className="text-senior-base text-blue-800">
            Use the <strong>Talk</strong> button to log a reading. For example, say <em>"My blood pressure is 130 over 80"</em>.
          </p>
          <Link href="/talk" className="block mt-3 bg-blue-700 text-white text-center py-3 rounded-xl font-bold">
            🎙️ Talk to log a reading
          </Link>
        </div>

        <Section title="Blood Pressure" emoji="❤️">
          {(bp ?? []).length === 0 ? <Empty msg="No blood pressure readings yet." /> : (
            <Table headers={["Reading", "Pulse", "When"]} rows={(bp ?? []).map((r) => [
              `${r.systolic}/${r.diastolic} ${r.out_of_range ? "⚠️" : ""}`,
              r.pulse?.toString() ?? "—",
              format(parseISO(r.recorded_at), "MMM d, h:mm a"),
            ])} />
          )}
        </Section>

        <Section title="Blood Sugar" emoji="🩸">
          {(sugar ?? []).length === 0 ? <Empty msg="No blood sugar readings yet." /> : (
            <Table headers={["Reading", "Context", "When"]} rows={(sugar ?? []).map((r) => [
              `${r.value} ${r.unit} ${r.out_of_range ? "⚠️" : ""}`,
              r.measurement_context ?? "—",
              format(parseISO(r.recorded_at), "MMM d, h:mm a"),
            ])} />
          )}
        </Section>

        <Section title="Other Vitals" emoji="🌡️">
          {(vitals ?? []).length === 0 ? <Empty msg="No vital readings yet." /> : (
            <Table headers={["Pulse", "Temp °F", "Weight", "When"]} rows={(vitals ?? []).map((r) => [
              r.pulse?.toString() ?? "—",
              r.temperature_f?.toString() ?? "—",
              r.weight_lbs ? `${r.weight_lbs} lb` : "—",
              format(parseISO(r.recorded_at), "MMM d"),
            ])} />
          )}
        </Section>
      </div>
    </SeniorShell>
  );
}

function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-senior-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h2>
      {children}
    </section>
  );
}

function Empty({ msg }: { msg: string }) {
  return <p className="text-gray-500 text-senior-sm bg-white border-2 border-gray-200 rounded-2xl p-4 text-center">{msg}</p>;
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h) => <th key={h} className="px-3 py-2 text-left font-semibold text-gray-700">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-gray-100">
              {row.map((cell, j) => <td key={j} className="px-3 py-2 text-gray-800">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
