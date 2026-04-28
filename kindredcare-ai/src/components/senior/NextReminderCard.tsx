import Link from "next/link";
import { CALENDAR_EVENT_TYPES } from "@/lib/constants";
import { describeUntil, formatTime } from "@/lib/utils/date";
import type { CalendarEvent } from "@/types/domain";

interface NextReminderCardProps {
  event: CalendarEvent | null;
  timezone: string;
}

export function NextReminderCard({ event, timezone }: NextReminderCardProps) {
  if (!event) {
    return (
      <Link
        href="/today"
        className="block rounded-3xl bg-white border-2 border-gray-200 p-5 text-center shadow-sm hover:bg-gray-50 transition-colors"
        aria-label="No reminders right now. View today."
      >
        <p className="text-3xl mb-1" aria-hidden="true">🌞</p>
        <p className="text-senior-base text-gray-700 font-semibold">
          You have no more reminders today.
        </p>
        <p className="text-senior-sm text-gray-500 mt-1">Enjoy your day.</p>
      </Link>
    );
  }

  const typeInfo = CALENDAR_EVENT_TYPES.find((t) => t.value === event.event_type);

  return (
    <Link
      href="/today"
      className="block rounded-3xl bg-amber-50 border-2 border-amber-400 p-5 shadow-sm hover:bg-amber-100 transition-colors"
      aria-label={`Next reminder: ${event.title} at ${formatTime(event.scheduled_at, timezone)}, ${describeUntil(event.scheduled_at)}`}
    >
      <p className="text-senior-sm font-semibold text-amber-800 uppercase tracking-wide mb-2">
        Next reminder
      </p>
      <div className="flex items-center gap-4">
        <span className="text-4xl flex-shrink-0" aria-hidden="true">
          {typeInfo?.icon ?? "📝"}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-senior-lg font-bold text-gray-900 leading-tight line-clamp-2">
            {event.title}
          </p>
          <p className="text-senior-base text-gray-700">
            {formatTime(event.scheduled_at, timezone)} · {describeUntil(event.scheduled_at)}
          </p>
        </div>
      </div>
    </Link>
  );
}
