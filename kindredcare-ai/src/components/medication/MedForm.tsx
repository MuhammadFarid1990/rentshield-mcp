"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FREQUENCIES = ["once daily", "twice daily", "three times daily", "every 4 hours", "every 6 hours", "every 8 hours", "every 12 hours", "as needed"];

export function MedForm({ seniorId, onSaved }: { seniorId: string; onSaved?: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    med_name: "", dosage: "", dosage_unit: "mg", frequency: "once daily",
    times: "08:00", instructions: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMessage(null);
    const times = form.times.split(",").map((t) => t.trim()).filter(Boolean);
    const res = await fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, times, seniorId }),
    });
    if (res.ok) {
      setMessage("Saved!");
      setForm({ med_name: "", dosage: "", dosage_unit: "mg", frequency: "once daily", times: "08:00", instructions: "" });
      onSaved?.();
      router.refresh();
    } else {
      setMessage("Could not save.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-white border-2 border-gray-200 rounded-2xl p-5">
      <h3 className="text-lg font-bold">Add Medication</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Medicine Name" value={form.med_name} onChange={(v) => setForm({ ...form, med_name: v })} required />
        <Field label="Dosage (e.g. 500)" value={form.dosage} onChange={(v) => setForm({ ...form, dosage: v })} required />
        <Field label="Unit" value={form.dosage_unit} onChange={(v) => setForm({ ...form, dosage_unit: v })} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Frequency</label>
          <select
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            className="border-2 border-gray-300 rounded-xl px-3 py-2"
          >
            {FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <Field label="Times (comma-separated, HH:MM)" value={form.times} onChange={(v) => setForm({ ...form, times: v })} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Instructions (optional)</label>
        <textarea
          rows={2}
          value={form.instructions}
          onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          className="border-2 border-gray-300 rounded-xl px-3 py-2 resize-none"
          placeholder="e.g. Take with food"
        />
      </div>
      {message && <p className="text-sm">{message}</p>}
      <button
        type="submit"
        disabled={saving}
        className="bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-bold disabled:opacity-60"
      >
        {saving ? "Saving…" : "Add Medication"}
      </button>
      <p className="text-xs text-gray-500">
        Always verify dosage with the prescribing doctor. KindredCare AI does not give medication advice.
      </p>
    </form>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">{label}{required && "*"}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="border-2 border-gray-300 rounded-xl px-3 py-2 focus:border-teal-500 focus:outline-none"
      />
    </div>
  );
}
