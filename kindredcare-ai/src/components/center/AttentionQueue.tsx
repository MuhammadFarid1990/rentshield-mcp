"use client";

import type { DailyCareStatus, Senior, User } from "@/types/domain";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface AttentionRow {
  status: DailyCareStatus;
  senior: Senior & { user: User };
}

const statusConfig = {
  green: { bg: "bg-green-50 border-green-300", badge: "bg-green-600", label: "Doing Well", dot: "bg-green-500" },
  yellow: { bg: "bg-yellow-50 border-yellow-300", badge: "bg-yellow-500", label: "Needs Follow-Up", dot: "bg-yellow-400" },
  red: { bg: "bg-red-50 border-red-300", badge: "bg-red-600", label: "Urgent Attention", dot: "bg-red-500" },
};

function StatusBadge({ level }: { level: "green" | "yellow" | "red" }) {
  const c = statusConfig[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-sm font-semibold", c.badge)}>
      <span className={cn("w-2 h-2 rounded-full bg-white/70")} />
      {c.label}
    </span>
  );
}

function StatusDot({ level }: { level: "green" | "yellow" | "red" }) {
  return (
    <span
      className={cn("inline-block w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0", statusConfig[level].dot)}
      aria-label={statusConfig[level].label}
    />
  );
}

interface AttentionQueueProps {
  rows: AttentionRow[];
}

export function AttentionQueue({ rows }: AttentionQueueProps) {
  const sorted = [...rows].sort((a, b) => {
    const order = { red: 0, yellow: 1, green: 2 };
    return order[a.status.overall_status] - order[b.status.overall_status];
  });

  return (
    <div className="flex flex-col gap-4">
      {sorted.length === 0 && (
        <p className="text-center text-gray-500 py-10 text-lg">All seniors are doing well today.</p>
      )}
      {sorted.map(({ status, senior }) => {
        const cfg = statusConfig[status.overall_status];
        const name = senior.preferred_name ?? senior.user?.full_name ?? "Senior";

        return (
          <Link
            key={status.id}
            href={`/center/seniors/${senior.id}`}
            className={cn(
              "border-2 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow",
              cfg.bg,
            )}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <StatusDot level={status.overall_status} />
                <span className="text-xl font-bold text-gray-900">{name}</span>
              </div>
              <StatusBadge level={status.overall_status} />
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {[
                { label: "Medicine", key: "medicine_status" as const },
                { label: "Meals", key: "meal_status" as const },
                { label: "Hydration", key: "hydration_status" as const },
                { label: "Mood", key: "mood_status" as const },
                { label: "Health", key: "health_status" as const },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center gap-1.5">
                  <StatusDot level={status[key]} />
                  <span className="text-gray-700">{label}</span>
                </div>
              ))}
            </div>

            {status.missed_reminders_count > 0 && (
              <p className="text-sm text-amber-700 font-medium">
                {status.missed_reminders_count} missed reminder{status.missed_reminders_count > 1 ? "s" : ""}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
