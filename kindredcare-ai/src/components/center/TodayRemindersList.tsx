import { CALENDAR_EVENT_TYPES } from "@/lib/constants";
import { formatTime } from "@/lib/utils/date";
import type { CalendarEvent } from "@/types/domain";

interface TodayRemindersListProps {
  events: CalendarEvent[];
  timezone?: string;
}

function eventIcon(eventType: string) {
  return CALENDAR_EVENT_TYPES.find((t) => t.value === eventType)?.icon ?? "📝";
}

export function TodayRemindersList({ events, timezone = "America/New_York" }: TodayRemindersListProps) {
  const completed = events.filter((e) => e.is_completed);
  const missed = events.filter((e) => !e.is_completed && !e.is_cancelled);

  if (events.length === 0) {
    return <p className="text-sm text-gray-500">No reminders scheduled today.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {missed.length > 0 && (
        <div>
          <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">
            Missed / Pending ({missed.length})
          </p>
          <ul className="divide-y divide-gray-100">
            {missed.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-2">
                <span className="text-lg flex-shrink-0" aria-hidden="true">{eventIcon(e.event_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{e.title}</p>
                  <p className="text-xs text-gray-500">{formatTime(e.scheduled_at, timezone)}</p>
                </div>
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex-shrink-0">
                  Missed
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">
            Completed ({completed.length})
          </p>
          <ul className="divide-y divide-gray-100">
            {completed.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-2">
                <span className="text-lg flex-shrink-0" aria-hidden="true">{eventIcon(e.event_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 truncate">{e.title}</p>
                  <p className="text-xs text-gray-400">{formatTime(e.scheduled_at, timezone)}</p>
                </div>
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">
                  ✓ Done
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
