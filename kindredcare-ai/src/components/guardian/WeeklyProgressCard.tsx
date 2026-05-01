import { format, parseISO } from "date-fns";
import type { WeeklyProgressReport } from "@/types/domain";
import { GenerateWeeklySummaryButton } from "@/components/center/GenerateWeeklySummaryButton";

interface WeeklyProgressCardProps {
  seniorId: string;
  report: WeeklyProgressReport | null;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

export function WeeklyProgressCard({ seniorId, report }: WeeklyProgressCardProps) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-lg font-bold text-gray-900">Weekly progress</h3>
        {report && (
          <p className="text-xs text-gray-500">
            Week of {format(parseISO(report.week_start), "MMM d")} – {format(parseISO(report.week_end), "MMM d")}
          </p>
        )}
      </div>

      {!report ? (
        <p className="text-sm text-gray-500 mb-4">
          No weekly summary yet. Generate one below to see how the past week went.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Stat label="Med Compliance" value={`${report.med_compliance_pct ?? 0}%`} />
          <Stat label="Missed" value={report.missed_reminders_count} />
          <Stat label="Check-ins" value={report.wellness_checkins_count} />
          <Stat label="BP Logs" value={report.bp_logs_count} />
          <Stat label="Sugar Logs" value={report.sugar_logs_count} />
          <Stat label="Loneliness" value={report.loneliness_logs_count} />
        </div>
      )}

      <GenerateWeeklySummaryButton
        seniorId={seniorId}
        existingSummary={report?.ai_summary ?? null}
      />
    </div>
  );
}
