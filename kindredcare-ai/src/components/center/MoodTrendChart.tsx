"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, parseISO, subDays, startOfDay } from "date-fns";
import type { WellnessCheckin } from "@/types/domain";

const NEGATIVE_MOODS = new Set(["lonely", "sad", "anxious", "unwell"]);

interface MoodTrendChartProps {
  checkins: WellnessCheckin[];
}

export function MoodTrendChart({ checkins }: MoodTrendChartProps) {
  if (checkins.length === 0) {
    return <p className="text-sm text-gray-500">Not enough data for trend.</p>;
  }

  // Build a map of date-string → { positive, negative }
  const today = new Date();
  const dayMap: Record<string, { positive: number; negative: number; date: string }> = {};
  for (let i = 13; i >= 0; i--) {
    const d = format(startOfDay(subDays(today, i)), "yyyy-MM-dd");
    dayMap[d] = { positive: 0, negative: 0, date: format(subDays(today, i), "MMM d") };
  }

  for (const c of checkins) {
    const key = c.checked_in_at.slice(0, 10);
    if (!dayMap[key]) continue;
    if (c.mood) {
      if (NEGATIVE_MOODS.has(c.mood)) {
        dayMap[key].negative += 1;
      } else {
        dayMap[key].positive += 1;
      }
    }
  }

  const chartData = Object.values(dayMap);
  const lonelyDays = checkins.filter(
    (c) => c.mood === "lonely" || c.mood === "sad",
  ).length;

  return (
    <div className="flex flex-col gap-3">
      {lonelyDays >= 3 && (
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl px-3 py-2 text-sm text-amber-800 font-medium">
          😔 Loneliness or sadness on {lonelyDays} of the last 14 days — consider follow-up
        </div>
      )}

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickLine={false}
            interval={2}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} />
          <Tooltip
            formatter={(value: number, name: string) => [value, name === "positive" ? "Positive mood" : "Low mood"]}
          />
          <Legend
            formatter={(value) => (value === "positive" ? "Positive" : "Low / Lonely")}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Bar dataKey="positive" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="negative" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
