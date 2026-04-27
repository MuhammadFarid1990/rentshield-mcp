"use client";

import { useState } from "react";
import Link from "next/link";

interface StaffQuickActionsProps {
  seniorId: string;
  seniorName: string;
  seniorPhone?: string | null;
  openAlertId?: string | null;
}

type Status = "idle" | "submitting" | "done" | "error";

export function StaffQuickActions({ seniorId, seniorName, seniorPhone, openAlertId }: StaffQuickActionsProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const post = async (path: string, body: Record<string, unknown>) => {
    setStatus("submitting");
    setMessage(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed");
      }
      setStatus("done");
      setMessage("Done.");
      setTimeout(() => { setStatus("idle"); setMessage(null); }, 2500);
      return true;
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
      return false;
    }
  };

  const patch = async (path: string, body: Record<string, unknown>) => {
    setStatus("submitting");
    setMessage(null);
    try {
      const res = await fetch(path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("done");
      setMessage("Marked resolved.");
      setTimeout(() => { setStatus("idle"); setMessage(null); }, 2500);
      return true;
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
      return false;
    }
  };

  const handleNotify = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    post("/api/staff/notify-guardian", {
      seniorId,
      reason: `Staff at the care center reached out about ${seniorName}.`,
    });
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    const ok = await post("/api/notes", { seniorId, content: note.trim() });
    if (ok) {
      setNote("");
      setShowNote(false);
    }
  };

  const handleResolve = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!openAlertId) return;
    patch("/api/alerts", { alertId: openAlertId, status: "resolved", resolution_note: "Resolved by care center staff." });
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div onClick={stop} className="border-t border-gray-200 pt-3 mt-1 flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {seniorPhone && (
          <a
            href={`tel:${seniorPhone.replace(/\D/g, "")}`}
            onClick={stop}
            className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            📞 Call
          </a>
        )}
        <button
          onClick={handleNotify}
          disabled={status === "submitting"}
          className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
        >
          🔔 Notify Guardian
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowNote((v) => !v); }}
          className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
        >
          📝 Note
        </button>
        <Link
          href={`/center/visits?seniorId=${seniorId}`}
          onClick={stop}
          className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          📅 Schedule Visit
        </Link>
        <Link
          href={`/center/transportation?seniorId=${seniorId}`}
          onClick={stop}
          className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          🚗 Transportation
        </Link>
        {openAlertId && (
          <button
            onClick={handleResolve}
            disabled={status === "submitting"}
            className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            ✅ Mark Resolved
          </button>
        )}
      </div>

      {showNote && (
        <form onSubmit={handleSaveNote} className="flex gap-2 mt-1" onClick={stop}>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Add a staff note about ${seniorName}…`}
            className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={!note.trim() || status === "submitting"}
            className="text-sm font-semibold px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50"
          >
            Save
          </button>
        </form>
      )}

      {message && (
        <p
          className={`text-xs font-medium ${status === "error" ? "text-red-700" : "text-green-700"}`}
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  );
}
