import Link from "next/link";
import type { SuggestedAction as Action, GuardianActionKey } from "@/lib/care-status/suggest";
import { cn } from "@/lib/utils/cn";

const styles = {
  info:   { border: "border-blue-300",   bg: "bg-blue-50",   text: "text-blue-900",   emoji: "💡", primary: "bg-blue-700 hover:bg-blue-800" },
  warn:   { border: "border-yellow-400", bg: "bg-yellow-50", text: "text-yellow-900", emoji: "⚠️", primary: "bg-yellow-600 hover:bg-yellow-700" },
  urgent: { border: "border-red-400",    bg: "bg-red-50",    text: "text-red-900",    emoji: "🚨", primary: "bg-red-600 hover:bg-red-700" },
};

interface ActionDef {
  key: GuardianActionKey;
  label: string;
  emoji: string;
  href: string;
}

interface SuggestedActionCardProps {
  action: Action;
  seniorId: string;
  seniorPhone?: string | null;
}

export function SuggestedActionCard({ action, seniorId, seniorPhone }: SuggestedActionCardProps) {
  const s = styles[action.level];

  const callHref = seniorPhone ? `tel:${seniorPhone.replace(/\D/g, "")}` : "/guardian/messages";

  const actions: ActionDef[] = [
    { key: "call",          label: "Call senior",       emoji: "📞", href: callHref },
    { key: "reminder",      label: "Add reminder",      emoji: "📅", href: `/guardian/calendar?seniorId=${seniorId}` },
    { key: "notify_center", label: "Notify care center",emoji: "🏛️", href: `/guardian/messages?seniorId=${seniorId}` },
    { key: "review_health", label: "Review health",     emoji: "❤️", href: `/guardian/health?seniorId=${seniorId}` },
  ];

  return (
    <div className={cn("border-2 rounded-2xl p-5 flex flex-col gap-4", s.bg, s.border)}>
      <div className="flex gap-3 items-start">
        <span className="text-3xl flex-shrink-0" aria-hidden="true">{s.emoji}</span>
        <div className="flex-1">
          <p className={cn("text-lg font-bold mb-1", s.text)}>{action.title}</p>
          <p className={cn("text-sm leading-relaxed", s.text)}>{action.detail}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Quick actions">
        {actions.map((a) => {
          const isPrimary = a.key === action.primaryAction;
          return (
            <Link
              key={a.key}
              href={a.href}
              className={cn(
                "rounded-xl px-3 py-3 text-sm font-bold flex items-center justify-center gap-2 min-h-[48px] transition-colors",
                "focus:outline-none focus:ring-4 focus:ring-offset-1",
                isPrimary
                  ? cn(s.primary, "text-white shadow-md ring-blue-200")
                  : "bg-white border-2 border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-gray-300 ring-gray-200",
              )}
            >
              <span aria-hidden="true">{a.emoji}</span>
              <span>{a.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
