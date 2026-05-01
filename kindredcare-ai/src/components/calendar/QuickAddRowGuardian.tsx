"use client";

import { QUICK_ADD_PRESETS } from "@/lib/constants";
import { useState } from "react";

interface QuickAddRowGuardianProps {
  seniorId: string;
  onAdded?: () => void;
}

export function QuickAddRowGuardian({ seniorId, onAdded }: QuickAddRowGuardianProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleClick = async (presetId: string) => {
    if (confirmingId !== presetId) {
      setConfirmingId(presetId);
      setTimeout(() => setConfirmingId(null), 3000);
      return;
    }
    setLoading(presetId);
    setConfirmingId(null);
    try {
      await fetch("/api/reminders/quick-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId, seniorId }),
      });
      onAdded?.();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {QUICK_ADD_PRESETS.map((p) => {
        const isConfirming = confirmingId === p.id;
        const isLoading = loading === p.id;
        return (
          <button
            key={p.id}
            onClick={() => handleClick(p.id)}
            disabled={isLoading}
            className={`px-3 py-3 rounded-xl border-2 text-sm font-semibold text-left transition-colors ${
              isConfirming ? "border-teal-600 bg-teal-100 text-teal-900" : "border-gray-200 bg-white text-gray-800 hover:border-teal-300"
            }`}
          >
            {isLoading ? "Adding…" : isConfirming ? "Click again to confirm" : p.label}
          </button>
        );
      })}
    </div>
  );
}
