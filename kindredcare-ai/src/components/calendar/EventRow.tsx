"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CALENDAR_EVENT_TYPES } from "@/lib/constants";
import type { CalendarEvent } from "@/types/domain";

function toDateTimeLocalValue(iso: string) {
  const d = new Date(iso);
  const offsetMs = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function EventRow({ event }: { event: CalendarEvent }) {
  const router = useRouter();
  const t = CALENDAR_EVENT_TYPES.find((x) => x.value === event.event_type);

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: event.title,
    scheduled_at: toDateTimeLocalValue(event.scheduled_at),
    location: event.location ?? "",
    voice_alert: event.voice_alert,
    description: event.description ?? "",
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/reminders/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        location: form.location || null,
        voice_alert: form.voice_alert,
        description: form.description || null,
      }),
    });
    setBusy(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  async function handleCancel() {
    if (!confirm(`Cancel "${event.title}"? It will be removed from the schedule.`)) return;
    setBusy(true);
    const res = await fetch(`/api/reminders/${event.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  async function handleComplete() {
    setBusy(true);
    const res = await fetch(`/api/reminders/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_completed: true }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="p-4 flex flex-col gap-3 bg-amber-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Title*</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border-2 border-gray-300 rounded-xl px-3 py-2"
            />
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
            <label className="text-sm font-semibold text-gray-700">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="border-2 border-gray-300 rounded-xl px-3 py-2"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Notes</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border-2 border-gray-300 rounded-xl px-3 py-2 resize-none"
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={form.voice_alert}
            onChange={(e) => setForm({ ...form, voice_alert: e.target.checked })}
            className="w-4 h-4"
          />
          Read this aloud at the scheduled time
        </label>
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
    <div className="p-4 flex items-center gap-4">
      <span className="text-2xl">{t?.icon ?? "📝"}</span>
      <div className="flex-1">
        <p className="font-bold text-gray-900">{event.title}</p>
        <p className="text-sm text-gray-500">{format(parseISO(event.scheduled_at), "EEE MMM d, h:mm a")}</p>
        {event.location && <p className="text-xs text-gray-500">📍 {event.location}</p>}
      </div>
      <div className="flex flex-col items-end gap-2">
        {event.is_completed ? (
          <span className="text-green-600 text-xl" title="Completed">✅</span>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleComplete}
              disabled={busy}
              className="text-xs font-semibold px-3 py-1 rounded-full border border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-60"
            >
              Done
            </button>
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-semibold px-3 py-1 rounded-full border border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Edit
            </button>
            <button
              onClick={handleCancel}
              disabled={busy}
              className="text-xs font-semibold px-3 py-1 rounded-full border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
