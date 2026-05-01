"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVITY_TYPES } from "@/lib/constants";

function toDateTimeLocalValue(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const offsetMs = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
}

const DEFAULT_FORM = {
  title: "",
  activity_type: "custom",
  description: "",
  scheduled_at: toDateTimeLocalValue(),
  duration_minutes: 60,
  location: "",
  max_participants: "",
  transportation_provided: false,
  tags: "",
};

export function ActivityForm({ careCenterId, onSaved }: { careCenterId: string; onSaved?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        careCenterId,
        title: form.title,
        activity_type: form.activity_type,
        description: form.description || null,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        duration_minutes: Number(form.duration_minutes),
        location: form.location || null,
        max_participants: form.max_participants ? Number(form.max_participants) : null,
        transportation_provided: form.transportation_provided,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : null,
      }),
    });
    setBusy(false);
    if (res.ok) {
      setForm({ ...DEFAULT_FORM, scheduled_at: toDateTimeLocalValue() });
      setOpen(false);
      onSaved?.();
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Could not save.");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-xl font-semibold"
      >
        + New Activity
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border-2 border-indigo-200 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">New Activity</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-semibold text-gray-700">Title*</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Morning Yoga"
            className="border-2 border-gray-300 rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Activity Type*</label>
          <select
            value={form.activity_type}
            onChange={(e) => setForm({ ...form, activity_type: e.target.value })}
            className="border-2 border-gray-300 rounded-xl px-3 py-2"
          >
            {ACTIVITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">When*</label>
          <input
            type="datetime-local"
            required
            value={form.scheduled_at}
            onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
            className="border-2 border-gray-300 rounded-xl px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Duration (minutes)</label>
          <input
            type="number"
            min={15}
            max={480}
            value={form.duration_minutes}
            onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
            className="border-2 border-gray-300 rounded-xl px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Location</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Main Hall, Room 4"
            className="border-2 border-gray-300 rounded-xl px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Max Participants</label>
          <input
            type="number"
            min={1}
            value={form.max_participants}
            onChange={(e) => setForm({ ...form, max_participants: e.target.value })}
            placeholder="Leave blank for unlimited"
            className="border-2 border-gray-300 rounded-xl px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Tags (comma-separated)</label>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="e.g. fitness, outdoor"
            className="border-2 border-gray-300 rounded-xl px-3 py-2"
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={form.transportation_provided}
              onChange={(e) => setForm({ ...form, transportation_provided: e.target.checked })}
              className="w-4 h-4"
            />
            Transportation provided
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Description (optional)</label>
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border-2 border-gray-300 rounded-xl px-3 py-2 resize-none"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={busy}
          className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white py-3 rounded-xl font-bold disabled:opacity-60">
          {busy ? "Saving…" : "Create Activity"}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="px-5 py-3 rounded-xl font-semibold border-2 border-gray-300">
          Cancel
        </button>
      </div>
    </form>
  );
}
