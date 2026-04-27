import Link from "next/link";
import type { SuggestedAction as Action } from "@/lib/care-status/suggest";
import { cn } from "@/lib/utils/cn";

const styles = {
  info: { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-900", emoji: "💡", btn: "bg-blue-700 hover:bg-blue-800" },
  warn: { border: "border-yellow-300", bg: "bg-yellow-50", text: "text-yellow-900", emoji: "⚠️", btn: "bg-yellow-600 hover:bg-yellow-700" },
  urgent: { border: "border-red-300", bg: "bg-red-50", text: "text-red-900", emoji: "🚨", btn: "bg-red-600 hover:bg-red-700" },
};

export function SuggestedActionCard({ action }: { action: Action }) {
  const s = styles[action.level];
  return (
    <div className={cn("border-2 rounded-2xl p-5 flex gap-4 items-start", s.bg, s.border)}>
      <span className="text-3xl flex-shrink-0" aria-hidden="true">{s.emoji}</span>
      <div className="flex-1">
        <p className={cn("text-lg font-bold mb-1", s.text)}>{action.title}</p>
        <p className={cn("text-sm leading-relaxed", s.text)}>{action.detail}</p>
        {action.actionHref && action.actionLabel && (
          <Link
            href={action.actionHref}
            className={cn(
              "inline-block mt-3 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors",
              s.btn,
            )}
          >
            {action.actionLabel} →
          </Link>
        )}
      </div>
    </div>
  );
}
