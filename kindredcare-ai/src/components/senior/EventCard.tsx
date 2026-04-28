"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CALENDAR_EVENT_TYPES } from "@/lib/constants";
import { formatTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import type { CalendarEvent } from "@/types/domain";

interface EventCardProps {
  event: CalendarEvent;
  timezone?: string;
}

export function EventCard({ event, timezone = "America/New_York" }: EventCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const done = event.is_completed;
  const typeInfo = CALENDAR_EVENT_TYPES.find((t) => t.value === event.event_type);

  function markDone() {
    if (done || isPending) return;
    startTransition(async () => {
      const res = await fetch(`/api/reminders/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: true }),
      });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-5 rounded-2xl border-2 shadow-sm",
        done ? "border-green-300 bg-green-50" : "border-gray-200 bg-white",
      )}
    >
      <span className="text-3xl flex-shrink-0" aria-hidden="true">
        {typeInfo?.icon ?? "📝"}
      </span>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-senior-base font-bold leading-tight",
          done ? "line-through text-gray-400" : "text-gray-900",
        )}>
          {event.title}
        </p>
        <p className="text-senior-sm text-gray-500">
          {formatTime(event.scheduled_at, timezone)}
        </p>
      </div>
      {done ? (
        <span className="text-3xl flex-shrink-0" aria-label="Completed">✅</span>
      ) : (
        <button
          type="button"
          onClick={markDone}
          disabled={isPending}
          aria-label={`Mark ${event.title} as done`}
          className={cn(
            "flex-shrink-0 px-4 py-3 rounded-2xl font-bold text-senior-sm",
            "bg-green-600 hover:bg-green-700 text-white",
            "focus:outline-none focus:ring-4 focus:ring-green-300",
            "disabled:opacity-60 active:scale-95 transition-all",
          )}
        >
          {isPending ? "…" : "Done"}
        </button>
      )}
    </div>
  );
}
