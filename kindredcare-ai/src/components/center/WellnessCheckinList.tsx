import { format, parseISO } from "date-fns";
import { MOOD_OPTIONS } from "@/lib/constants";
import type { WellnessCheckin } from "@/types/domain";

interface WellnessCheckinListProps {
  checkins: WellnessCheckin[];
}

function moodEmoji(mood: string | null | undefined) {
  if (!mood) return "—";
  return MOOD_OPTIONS.find((m) => m.value === mood)?.emoji ?? mood;
}

const energyLabel: Record<string, string> = { high: "High ⚡", medium: "Medium", low: "Low 🔋" };
const sleepLabel: Record<string, string> = { great: "Great 😴", good: "Good", fair: "Fair", poor: "Poor 😵" };

export function WellnessCheckinList({ checkins }: WellnessCheckinListProps) {
  if (checkins.length === 0) {
    return <p className="text-sm text-gray-500">No wellness check-ins in the last 7 days.</p>;
  }

  const lonelinessCount = checkins.filter(
    (c) => c.mood === "lonely" || c.mood === "sad",
  ).length;

  return (
    <div className="flex flex-col gap-3">
      {lonelinessCount >= 2 && (
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl px-3 py-2 text-sm text-amber-800 font-medium">
          😔 Loneliness or sadness reported {lonelinessCount} of {checkins.length} check-ins this week
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Mood</th>
              <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Energy</th>
              <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Sleep</th>
              <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Meals / Water</th>
            </tr>
          </thead>
          <tbody>
            {checkins.map((c) => (
              <tr key={c.id} className="border-b border-gray-50">
                <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">
                  {format(parseISO(c.checked_in_at), "MMM d")}
                </td>
                <td className="py-2 pr-4 text-lg">{moodEmoji(c.mood)}</td>
                <td className="py-2 pr-4 text-gray-600">
                  {c.energy_level ? energyLabel[c.energy_level] ?? c.energy_level : "—"}
                </td>
                <td className="py-2 pr-4 text-gray-600">
                  {c.sleep_quality ? sleepLabel[c.sleep_quality] ?? c.sleep_quality : "—"}
                </td>
                <td className="py-2 text-gray-600">
                  {c.meals_eaten != null ? `${c.meals_eaten} meals` : "—"}
                  {c.water_intake_oz != null ? ` · ${c.water_intake_oz}oz` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
