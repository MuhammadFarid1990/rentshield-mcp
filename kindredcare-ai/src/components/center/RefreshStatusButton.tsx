"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RefreshStatusButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  async function handleRefresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/care-status/refresh-all", { method: "POST" });
      if (res.ok) {
        const { recomputed } = await res.json();
        setLastRefreshed(`${recomputed} senior${recomputed !== 1 ? "s" : ""} updated`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border-2 border-indigo-300 text-indigo-800 font-semibold text-sm hover:bg-indigo-100 transition-colors disabled:opacity-50"
      >
        <span aria-hidden="true">{loading ? "⏳" : "🔄"}</span>
        {loading ? "Refreshing…" : "Refresh Status"}
      </button>
      {lastRefreshed && (
        <span className="text-xs text-green-700 font-medium">✓ {lastRefreshed}</span>
      )}
    </div>
  );
}
