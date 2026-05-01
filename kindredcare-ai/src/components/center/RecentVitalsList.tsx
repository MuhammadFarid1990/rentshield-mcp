import { format, parseISO } from "date-fns";
import type { BloodPressureRecord, BloodSugarRecord } from "@/types/domain";

interface RecentVitalsListProps {
  bp: BloodPressureRecord[];
  sugar: BloodSugarRecord[];
}

export function RecentVitalsList({ bp, sugar }: RecentVitalsListProps) {
  const recentBP = bp.slice(0, 5);
  const recentSugar = sugar.slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Blood Pressure (last 5)</p>
        {recentBP.length === 0 ? (
          <p className="text-sm text-gray-400">No readings.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentBP.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2">
                <span className={`font-semibold text-sm ${r.out_of_range ? "text-red-700" : "text-gray-800"}`}>
                  {r.out_of_range && <span className="mr-1" aria-label="Out of range">⚠️</span>}
                  {r.systolic}/{r.diastolic}
                  {r.pulse ? ` · ${r.pulse} bpm` : ""}
                </span>
                <span className="text-xs text-gray-400">{format(parseISO(r.recorded_at), "MMM d, h:mm a")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Blood Sugar (last 5)</p>
        {recentSugar.length === 0 ? (
          <p className="text-sm text-gray-400">No readings.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentSugar.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2">
                <span className={`font-semibold text-sm ${r.out_of_range ? "text-red-700" : "text-gray-800"}`}>
                  {r.out_of_range && <span className="mr-1" aria-label="Out of range">⚠️</span>}
                  {r.value} {r.unit}
                  {r.measurement_context && ` (${r.measurement_context})`}
                </span>
                <span className="text-xs text-gray-400">{format(parseISO(r.recorded_at), "MMM d, h:mm a")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
