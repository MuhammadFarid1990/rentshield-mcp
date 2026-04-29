import Link from "next/link";
import { format, parseISO } from "date-fns";
import type { RiskAlert } from "@/types/domain";

interface RecentAlertsCardProps {
  alerts: RiskAlert[];
}

const severityStyles: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-red-100",    text: "text-red-700",    label: "Critical" },
  high:     { bg: "bg-orange-100", text: "text-orange-700", label: "High" },
  medium:   { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium" },
  low:      { bg: "bg-blue-100",   text: "text-blue-700",   label: "Low" },
};

export function RecentAlertsCard({ alerts }: RecentAlertsCardProps) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">Recent alerts</h3>
        <Link
          href="/guardian/alerts"
          className="text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          View all →
        </Link>
      </div>

      {alerts.length === 0 ? (
        <p className="text-sm text-green-700 font-medium bg-green-50 border border-green-200 rounded-xl p-3">
          🌟 No open alerts — everything looks good.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {alerts.map((a) => {
            const sev = severityStyles[a.severity] ?? severityStyles.low;
            return (
              <li key={a.id} className="py-3 flex items-start gap-3">
                <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full flex-shrink-0 ${sev.bg} ${sev.text}`}>
                  {sev.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{a.title}</p>
                  {a.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{a.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {format(parseISO(a.created_at), "MMM d, h:mm a")} · {a.category}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
