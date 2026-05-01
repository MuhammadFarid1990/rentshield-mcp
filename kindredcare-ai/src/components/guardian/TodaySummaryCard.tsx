import { MOOD_OPTIONS } from "@/lib/constants";
import { format, parseISO } from "date-fns";

export interface TodaySummary {
  medicine: { taken: number; total: number };
  meals:    { completed: number; total: number };
  hydration:{ completed: number; total: number };
  wellnessCheckin: { mood: string | null; checkedInAt: string | null };
  health:   { bp: string | null; sugar: string | null };
  missedReminders: number;
  openAlerts: number;
}

interface TodaySummaryCardProps {
  summary: TodaySummary;
}

function moodEmoji(mood: string | null) {
  if (!mood) return null;
  return MOOD_OPTIONS.find((m) => m.value === mood)?.emoji ?? null;
}

function moodLabel(mood: string | null) {
  if (!mood) return null;
  return MOOD_OPTIONS.find((m) => m.value === mood)?.label ?? mood;
}

function complianceColor(taken: number, total: number) {
  if (total === 0) return "text-gray-500";
  const pct = taken / total;
  if (pct >= 1) return "text-green-700";
  if (pct >= 0.5) return "text-yellow-700";
  return "text-red-700";
}

function Row({ icon, label, value, sub }: { icon: string; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-2xl flex-shrink-0" aria-hidden="true">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
        <p className="text-base font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function TodaySummaryCard({ summary }: TodaySummaryCardProps) {
  const { medicine, meals, hydration, wellnessCheckin, health, missedReminders, openAlerts } = summary;
  const mood = moodEmoji(wellnessCheckin.mood);
  const moodWord = moodLabel(wellnessCheckin.mood);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Today&apos;s summary</h3>
      <div>
        <Row
          icon="💊"
          label="Medicine"
          value={
            <span className={complianceColor(medicine.taken, medicine.total)}>
              {medicine.total === 0 ? "No medicines scheduled" : `${medicine.taken} of ${medicine.total} taken`}
            </span>
          }
        />
        <Row
          icon="🍽️"
          label="Meals & hydration"
          value={
            meals.total + hydration.total === 0
              ? "Nothing scheduled"
              : `${meals.completed}/${meals.total} meals · ${hydration.completed}/${hydration.total} water`
          }
        />
        <Row
          icon="🩺"
          label="Wellness check-in"
          value={
            wellnessCheckin.checkedInAt
              ? <span>Done at {format(parseISO(wellnessCheckin.checkedInAt), "h:mm a")}</span>
              : <span className="text-gray-500 font-medium">Not yet today</span>
          }
        />
        <Row
          icon={mood ?? "🙂"}
          label="Mood"
          value={
            mood
              ? <span>{mood} {moodWord}</span>
              : <span className="text-gray-500 font-medium">Not reported</span>
          }
        />
        <Row
          icon="❤️"
          label="Health logs"
          value={
            health.bp || health.sugar
              ? [health.bp && `BP ${health.bp}`, health.sugar && `Sugar ${health.sugar}`].filter(Boolean).join(" · ")
              : <span className="text-gray-500 font-medium">No readings today</span>
          }
        />
        <Row
          icon={missedReminders > 0 ? "⚠️" : "✓"}
          label="Missed reminders"
          value={
            missedReminders === 0
              ? <span className="text-green-700">None</span>
              : <span className="text-red-700">{missedReminders} missed</span>
          }
        />
        <Row
          icon={openAlerts > 0 ? "🚨" : "🛡️"}
          label="Risk alerts"
          value={
            openAlerts === 0
              ? <span className="text-green-700">No open alerts</span>
              : <span className="text-red-700">{openAlerts} open</span>
          }
        />
      </div>
    </div>
  );
}
