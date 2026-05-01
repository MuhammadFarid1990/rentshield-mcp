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
    headline: "Doing well today",
    textColor: "text-green-800",
    subColor: "text-green-700",
  },
  yellow: {
    bg: "bg-yellow-50 border-yellow-400",
    icon: "⚠️",
    headline: "Needs follow-up today",
    textColor: "text-yellow-800",
    subColor: "text-yellow-700",
  },
  red: {
    bg: "bg-red-50 border-red-400",
    icon: "🚨",
    headline: "Urgent attention needed",
    textColor: "text-red-800",
    subColor: "text-red-700",
  },
};

function buildSummaryLine(s: DailyCareStatus): string {
  const parts: string[] = [];
  if (s.missed_reminders_count > 0) {
    parts.push(`${s.missed_reminders_count} missed reminder${s.missed_reminders_count > 1 ? "s" : ""}`);
  }
  if (s.open_alerts_count > 0) {
    parts.push(`${s.open_alerts_count} open alert${s.open_alerts_count > 1 ? "s" : ""}`);
  }
  if (s.checkin_completed) {
    parts.push("check-in done");
  } else {
    parts.push("no check-in yet");
  }
  return parts.join(" · ");
}

export function StatusHero({ status, seniorName }: StatusHeroProps) {
  if (!status) {
    return (
      <div className="bg-gray-50 border-2 border-gray-300 rounded-3xl p-6 text-center">
        <p className="text-xl text-gray-600">No status available yet for today.</p>
        <p className="text-sm text-gray-400 mt-1">It will appear once the care center has data.</p>
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
        {firstName} — {c.headline}
      </p>
      <p className={cn("text-sm font-medium", c.subColor)}>
        {buildSummaryLine(status)}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-left">
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
