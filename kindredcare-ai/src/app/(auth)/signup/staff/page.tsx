"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { CareCenter } from "@/types/domain";

export default function StaffSignupPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    title: "",
    care_center_id: "",
  });
  const [centers, setCenters] = useState<CareCenter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("care_centers")
      .select("id, name")
      .order("name")
      .then(({ data }) => setCenters((data ?? []) as CareCenter[]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.care_center_id) {
      setError("Please select a care center.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role: "staff" } },
    });

    if (authError || !data.user) {
      setError(authError?.message ?? "Could not create account.");
      setLoading(false);
      return;
    }

    await supabase.from("staff").insert({
      user_id: data.user.id,
      care_center_id: form.care_center_id,
      title: form.title || null,
    });

    router.push("/center/monitoring");
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 flex flex-col gap-5">
        <div className="text-center">
          <span className="text-5xl">🏥</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Care Center Staff Signup</h1>
        </div>

        {error && <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-700">Care Center</label>
            <select
              required
              value={form.care_center_id}
              onChange={(e) => setForm({ ...form, care_center_id: e.target.value })}
              className="border-2 border-gray-300 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select your center…</option>
              {centers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {centers.length === 0 && (
              <p className="text-sm text-gray-500">No centers available yet. Ask an administrator to create one first.</p>
            )}
          </div>

          <Field label="Full Name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
          <Field label="Title / Role" placeholder="e.g. Care Coordinator, RN" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-lg py-4 rounded-xl mt-2 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create Staff Account"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label, type = "text", value, onChange, required, placeholder,
}: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-semibold text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="border-2 border-gray-300 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:outline-none"
      />
    </div>
  );
}
