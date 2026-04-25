"use client";

import type { DailyCareStatus } from "@/types/domain";
import { cn } from "@/lib/utils/cn";

interface StatusHeroProps {
  status: DailyCareStatus | null;
  seniorName: string;
}

const config = {
  green: {
    bg: "bg-green-50 border-green-400",
    icon: "✅",
    headline: "is doing well today.",
    textColor: "text-green-800",
  },
  yellow: {
    bg: "bg-yellow-50 border-yellow-400",
    icon: "⚠️",
    headline: "may need some follow-up today.",
    textColor: "text-yellow-800",
  },
  red: {
    bg: "bg-red-50 border-red-400",
    icon: "🚨",
    headline: "needs urgent attention.",
    textColor: "text-red-800",
  },
};

export function StatusHero({ status, seniorName }: StatusHeroProps) {
  if (!status) {
    return (
      <div className="bg-gray-50 border-2 border-gray-300 rounded-3xl p-6 text-center">
        <p className="text-xl text-gray-600">No status available yet for today.</p>
      </div>
    );
  }

  const level = status.overall_status;
  const c = config[level];
  const firstName = seniorName.split(" ")[0];

  return (
    <div className={cn("border-2 rounded-3xl p-6 flex flex-col gap-3 text-center", c.bg)}>
      <span className="text-5xl" aria-hidden="true">{c.icon}</span>
      <p className={cn("text-2xl font-bold", c.textColor)}>
        {firstName} {c.headline}
      </p>
      <div className="grid grid-cols-2 gap-2 mt-2 text-left">
        {[
          { label: "Medicine", key: "medicine_status" as const },
          { label: "Meals", key: "meal_status" as const },
          { label: "Hydration", key: "hydration_status" as const },
          { label: "Mood", key: "mood_status" as const },
          { label: "Health", key: "health_status" as const },
          { label: "Check-in", val: status.checkin_completed ? "green" : "yellow" as const },
        ].map(({ label, key, val }) => {
          const lvl = (key ? status[key] : val) as "green" | "yellow" | "red";
          const dot = { green: "bg-green-500", yellow: "bg-yellow-400", red: "bg-red-500" }[lvl];
          return (
            <div key={label} className="flex items-center gap-2 text-gray-700 text-sm">
              <span className={cn("w-3 h-3 rounded-full flex-shrink-0", dot)} />
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
