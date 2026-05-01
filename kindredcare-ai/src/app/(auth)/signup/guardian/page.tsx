"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function GuardianSignupPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    relationship: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role: "guardian" } },
    });

    if (authError || !data.user) {
      setError(authError?.message ?? "Could not create account.");
      setLoading(false);
      return;
    }

    await supabase.from("guardians").insert({
      user_id: data.user.id,
      relationship: form.relationship || null,
    });

    router.push("/guardian/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 flex flex-col gap-5">
        <div className="text-center">
          <span className="text-5xl">👨‍👩‍👧</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Guardian Signup</h1>
          <p className="text-gray-500 mt-1">Create your account to support your loved one</p>
        </div>

        {error && <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Full Name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
          <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
          <Field
            label="Relationship to Senior"
            placeholder="e.g. Daughter, Son, Spouse"
            value={form.relationship}
            onChange={(v) => setForm({ ...form, relationship: v })}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-lg py-4 rounded-xl mt-2 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create Guardian Account"}
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
        className="border-2 border-gray-300 rounded-xl px-4 py-2.5 focus:border-teal-500 focus:outline-none"
      />
    </div>
  );
}
