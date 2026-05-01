"use client";

import { useState } from "react";
import { BigButton } from "@/components/senior/BigButton";

export function BPForm({ seniorId, onSaved }: { seniorId: string; onSaved?: () => void }) {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/health/bp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seniorId,
        systolic: parseInt(systolic, 10),
        diastolic: parseInt(diastolic, 10),
        pulse: pulse ? parseInt(pulse, 10) : null,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      setMessage(result.message ?? "Saved!");
      setSystolic(""); setDiastolic(""); setPulse("");
      onSaved?.();
    } else {
      setMessage(result.error ?? "Could not save.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white border-2 border-gray-200 rounded-2xl p-5">
      <h3 className="text-lg font-bold">Log Blood Pressure</h3>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Systolic" value={systolic} onChange={setSystolic} />
        <Field label="Diastolic" value={diastolic} onChange={setDiastolic} />
        <Field label="Pulse (opt)" value={pulse} onChange={setPulse} />
      </div>
      {message && <p className="text-sm font-medium bg-blue-50 border-l-4 border-blue-400 p-2 rounded-r">{message}</p>}
      <BigButton type="submit" disabled={!systolic || !diastolic || saving}>
        {saving ? "Saving…" : "Save Reading"}
      </BigButton>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-2 border-gray-300 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}
