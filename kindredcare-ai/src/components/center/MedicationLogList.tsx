import { format, parseISO } from "date-fns";
import type { MedicationLog } from "@/types/domain";

interface MedicationLogListProps {
  logs: MedicationLog[];
}

const statusConfig: Record<MedicationLog["status"], { label: string; bg: string; text: string }> = {
  taken:   { label: "Taken",   bg: "bg-green-100",  text: "text-green-700" },
  missed:  { label: "Missed",  bg: "bg-red-100",    text: "text-red-700"   },
  skipped: { label: "Skipped", bg: "bg-gray-100",   text: "text-gray-600"  },
  pending: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-700" },
};

export function MedicationLogList({ logs }: MedicationLogListProps) {
  if (logs.length === 0) {
    return <p className="text-sm text-gray-500">No medication logs in the last 7 days.</p>;
  }

  const taken = logs.filter((l) => l.status === "taken").length;
  const missed = logs.filter((l) => l.status === "missed").length;
  const compliance = logs.length > 0 ? Math.round((taken / logs.length) * 100) : 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-4 text-sm">
        <span className="font-semibold text-green-700">✓ {taken} taken</span>
        <span className="font-semibold text-red-700">✗ {missed} missed</span>
        <span className="font-semibold text-gray-700">{compliance}% compliance</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Medication</th>
              <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Scheduled</th>
              <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Taken At</th>
              <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const cfg = statusConfig[log.status];
              return (
                <tr key={log.id} className="border-b border-gray-50">
                  <td className="py-2 pr-4 font-medium">💊 {log.med_name}</td>
                  <td className="py-2 pr-4 text-gray-600">
                    {format(parseISO(log.scheduled_time), "MMM d, h:mm a")}
                  </td>
                  <td className="py-2 pr-4 text-gray-500">
                    {log.taken_at ? format(parseISO(log.taken_at), "h:mm a") : "—"}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
