"use client";

import { cn } from "@/lib/utils/cn";

export interface QuickAction {
  label: string;
  emoji: string;
  prompt: string;
  variant?: "default" | "warm" | "alert";
}

const DEFAULT_ACTIONS: QuickAction[] = [
  { label: "I took my medicine", emoji: "💊", prompt: "I took my medicine" },
  { label: "Read my schedule", emoji: "📅", prompt: "Read my day" },
  { label: "Log blood pressure", emoji: "❤️", prompt: "I want to log my blood pressure" },
  { label: "I feel lonely", emoji: "🤍", prompt: "I feel lonely", variant: "warm" },
  { label: "I need help", emoji: "🆘", prompt: "I need help", variant: "alert" },
  { label: "Call guardian", emoji: "📞", prompt: "Call my guardian" },
  { label: "Call care center", emoji: "🏥", prompt: "Call the care center" },
];

const variantStyles: Record<NonNullable<QuickAction["variant"]>, string> = {
  default: "border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100",
  warm: "border-pink-300 bg-pink-50 text-pink-900 hover:bg-pink-100",
  alert: "border-red-300 bg-red-50 text-red-900 hover:bg-red-100",
};

interface QuickActionRowProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
  actions?: QuickAction[];
}

export function QuickActionRow({ onSelect, disabled, actions = DEFAULT_ACTIONS }: QuickActionRowProps) {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="flex gap-2 pb-1 min-w-max" role="list" aria-label="Quick actions">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            role="listitem"
            disabled={disabled}
            onClick={() => onSelect(a.prompt)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-2xl border-2",
              "text-senior-sm font-semibold whitespace-nowrap",
              "transition-colors active:scale-95 disabled:opacity-50",
              "focus:outline-none focus:ring-4 focus:ring-blue-300",
              variantStyles[a.variant ?? "default"],
            )}
            aria-label={a.label}
          >
            <span className="text-2xl" aria-hidden="true">{a.emoji}</span>
            <span>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
