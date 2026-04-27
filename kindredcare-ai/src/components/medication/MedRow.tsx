"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MedicationSchedule } from "@/types/domain";

const FREQUENCIES = ["once daily", "twice daily", "three times daily", "every 4 hours", "every 6 hours", "every 8 hours", "every 12 hours", "as needed"];

export function MedRow({ med }: { med: MedicationSchedule }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    med_name: med.med_name,
    dosage: med.dosage,
    dosage_unit: med.dosage_unit ?? "",
    frequency: med.frequency,
    times: (med.times ?? []).join(", "),
    instructions: med.instructions ?? "",
    is_active: med.is_active,
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const times = form.times.split(",").map((t) => t.trim()).filter(Boolean);
    const res = await fetch(`/api/medications/${med.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        med_name: form.med_name,
        dosage: form.dosage,
        dosage_unit: form.dosage_unit || null,
        frequency: form.frequency,
        times,
        instructions: form.instructions || null,
        is_active: form.is_active,
      }),
    });
    setBusy(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  async function handleDeactivate() {
    if (!confirm(`Deactivate ${med.med_name}? This will stop reminders. The dose log stays for the record.`)) return;
    setBusy(true);
    const res = await fetch(`/api/medications/${med.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="p-4 flex flex-col gap-3 bg-amber-50">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Medicine" value={form.med_name} onChange={(v) => setForm({ ...form, med_name: v })} required />
          <Input label="Dosage" value={form.dosage} onChange={(v) => setForm({ ...form, dosage: v })} required />
          <Input label="Unit" value={form.dosage_unit} onChange={(v) => setForm({ ...form, dosage_unit: v })} />
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
          <Input label="Times (HH:MM, comma-separated)" value={form.times} onChange={(v) => setForm({ ...form, times: v })} />
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              Active
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Instructions</label>
          <textarea
            rows={2}
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            className="border-2 border-gray-300 rounded-xl px-3 py-2 resize-none"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="flex-1 bg-teal-700 hover:bg-teal-800 text-white py-2 rounded-xl font-bold disabled:opacity-60">
            {busy ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 rounded-xl font-semibold border-2 border-gray-300">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="p-4 flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="font-bold text-gray-900">💊 {med.med_name} {med.dosage}{med.dosage_unit ? ` ${med.dosage_unit}` : ""}</p>
        <p className="text-sm text-gray-600">{med.frequency} — {(med.times ?? []).join(", ")}</p>
        {med.instructions && <p className="text-sm text-gray-500 mt-1 italic">{med.instructions}</p>}
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${med.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {med.is_active ? "Active" : "Inactive"}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-semibold px-3 py-1 rounded-full border border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            Edit
          </button>
          {med.is_active && (
            <button
              onClick={handleDeactivate}
              disabled={busy}
              className="text-xs font-semibold px-3 py-1 rounded-full border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              Deactivate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
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
