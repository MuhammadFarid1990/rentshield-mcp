"use client";

import { useState } from "react";

interface GenerateWeeklySummaryButtonProps {
  seniorId: string;
  existingSummary?: string | null;
}

export function GenerateWeeklySummaryButton({ seniorId, existingSummary }: GenerateWeeklySummaryButtonProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(existingSummary ?? null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seniorId }),
      });
      if (!res.ok) throw new Error("Failed to generate summary");
      const { summary: text } = await res.json();
      setSummary(text);
    } catch {
      setError("Could not generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="self-start flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white rounded-xl font-semibold text-sm hover:bg-indigo-800 transition-colors disabled:opacity-50"
      >
        <span aria-hidden="true">{loading ? "⏳" : "✨"}</span>
        {loading ? "Generating…" : "Generate Weekly Summary"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {summary && (
        <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-r-xl p-4 text-sm text-indigo-900">
          <p className="font-semibold mb-1">AI Weekly Summary</p>
          <p className="leading-relaxed">{summary}</p>
        </div>
      )}
    </div>
  );
}
