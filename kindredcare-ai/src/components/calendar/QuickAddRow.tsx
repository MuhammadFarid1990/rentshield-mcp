"use client";

import { QUICK_ADD_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

interface QuickAddRowProps {
  seniorId: string;
  onAdded?: () => void;
}

export function QuickAddRow({ seniorId, onAdded }: QuickAddRowProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleQuickAdd = async (presetId: string) => {
    setLoading(presetId);
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
    <div className="overflow-x-auto">
      <div className="flex gap-3 pb-2 min-w-max">
        {QUICK_ADD_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleQuickAdd(preset.id)}
            disabled={loading === preset.id}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl border-2 text-sm font-semibold",
              "transition-all duration-150 active:scale-95",
              "border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100",
              "disabled:opacity-60 disabled:cursor-not-allowed",
            )}
          >
            {loading === preset.id ? "Adding…" : preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
