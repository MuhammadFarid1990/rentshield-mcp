"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Doctor } from "@/types/domain";

export function DoctorRow({ doctor }: { doctor: Doctor }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: doctor.full_name,
    specialty: doctor.specialty ?? "",
    clinic_name: doctor.clinic_name ?? "",
    phone: doctor.phone ?? "",
    office_hours: doctor.office_hours ?? "",
    notes: doctor.notes ?? "",
    is_primary: doctor.is_primary,
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/doctors/${doctor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: form.full_name,
        specialty: form.specialty || null,
        clinic_name: form.clinic_name || null,
        phone: form.phone || null,
        office_hours: form.office_hours || null,
        notes: form.notes || null,
        is_primary: form.is_primary,
      }),
    });
    setBusy(false);
    if (res.ok) { setEditing(false); router.refresh(); }
  }

  async function handleDelete() {
    if (!confirm(`Remove Dr. ${doctor.full_name}?`)) return;
    setBusy(true);
    const res = await fetch(`/api/doctors/${doctor.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="p-4 flex flex-col gap-3 bg-amber-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Full Name*" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
          <Input label="Specialty" value={form.specialty} onChange={(v) => setForm({ ...form, specialty: v })} />
          <Input label="Clinic / Practice" value={form.clinic_name} onChange={(v) => setForm({ ...form, clinic_name: v })} />
          <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Input label="Office Hours" value={form.office_hours} onChange={(v) => setForm({ ...form, office_hours: v })} />
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input type="checkbox" checked={form.is_primary} onChange={(e) => setForm({ ...form, is_primary: e.target.checked })} className="w-4 h-4" />
              Primary Doctor
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Notes</label>
          <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="border-2 border-gray-300 rounded-xl px-3 py-2 resize-none" />
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
    <div className="p-4 flex items-start gap-4">
      <div className="text-2xl">{doctor.is_primary ? "⭐" : "👨‍⚕️"}</div>
      <div className="flex-1">
        <p className="font-bold text-gray-900">{doctor.full_name}{doctor.is_primary && <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Primary</span>}</p>
        {doctor.specialty && <p className="text-sm text-gray-600">{doctor.specialty}{doctor.clinic_name ? ` · ${doctor.clinic_name}` : ""}</p>}
        {doctor.phone && <p className="text-sm text-gray-500">📞 {doctor.phone}</p>}
        {doctor.office_hours && <p className="text-xs text-gray-400">{doctor.office_hours}</p>}
        {doctor.notes && <p className="text-sm text-gray-500 italic mt-1">{doctor.notes}</p>}
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={() => setEditing(true)}
          className="text-xs font-semibold px-3 py-1 rounded-full border border-blue-300 text-blue-700 hover:bg-blue-50">
          Edit
        </button>
        <button onClick={handleDelete} disabled={busy}
          className="text-xs font-semibold px-3 py-1 rounded-full border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60">
          Remove
        </button>
      </div>
    </div>
  );
}

export function DoctorForm({ seniorId }: { seniorId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ full_name: "", specialty: "", clinic_name: "", phone: "", office_hours: "", notes: "", is_primary: false });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seniorId, ...form, specialty: form.specialty || null, clinic_name: form.clinic_name || null, phone: form.phone || null, office_hours: form.office_hours || null, notes: form.notes || null }),
    });
    setBusy(false);
    if (res.ok) {
      setForm({ full_name: "", specialty: "", clinic_name: "", phone: "", office_hours: "", notes: "", is_primary: false });
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-bold">
        + Add Doctor
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-white border-2 border-gray-200 rounded-2xl p-5">
      <h3 className="text-lg font-bold">Add Doctor</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Full Name*" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
        <Input label="Specialty" value={form.specialty} onChange={(v) => setForm({ ...form, specialty: v })} />
        <Input label="Clinic / Practice" value={form.clinic_name} onChange={(v) => setForm({ ...form, clinic_name: v })} />
        <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <Input label="Office Hours (e.g. Mon–Fri 9–5)" value={form.office_hours} onChange={(v) => setForm({ ...form, office_hours: v })} />
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" checked={form.is_primary} onChange={(e) => setForm({ ...form, is_primary: e.target.checked })} className="w-4 h-4" />
            Primary Doctor
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Notes (optional)</label>
        <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="border-2 border-gray-300 rounded-xl px-3 py-2 resize-none" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="flex-1 bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-bold disabled:opacity-60">
          {busy ? "Saving…" : "Add Doctor"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl font-semibold border-2 border-gray-300">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Input({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="border-2 border-gray-300 rounded-xl px-3 py-2 focus:border-teal-500 focus:outline-none" />
    </div>
  );
}
