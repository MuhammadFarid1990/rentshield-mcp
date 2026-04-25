import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SeniorShellProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backHref?: string;
  highContrast?: boolean;
}

export function SeniorShell({
  children,
  title,
  showBack = false,
  backHref = "/home",
  highContrast = false,
}: SeniorShellProps) {
  return (
    <div
      className={cn(
        "senior-shell min-h-screen flex flex-col bg-gray-50",
        highContrast && "high-contrast",
      )}
    >
      {/* Header */}
      <header className="bg-blue-700 text-white px-4 py-4 flex items-center gap-4 shadow-md sticky top-0 z-10">
        {showBack && (
          <Link
            href={backHref}
            className="text-white font-bold text-2xl px-2 py-1 rounded-xl hover:bg-blue-600 transition-colors min-h-[48px] flex items-center"
            aria-label="Go back"
          >
            ← Back
          </Link>
        )}
        <div className="flex-1">
          {title && (
            <h1 className="text-senior-xl font-bold leading-tight">{title}</h1>
          )}
          {!title && (
            <span className="text-senior-lg font-bold">KindredCare AI</span>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full py-4">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="bg-white border-t-2 border-gray-200 px-2 py-2 flex justify-around sticky bottom-0 z-10">
        {[
          { href: "/home", label: "Home", emoji: "🏠" },
          { href: "/talk", label: "Talk", emoji: "🎙️" },
          { href: "/today", label: "Today", emoji: "📅" },
          { href: "/help", label: "Help", emoji: "🆘" },
        ].map(({ href, label, emoji }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors min-h-[56px] justify-center text-gray-700"
          >
            <span className="text-2xl" aria-hidden="true">{emoji}</span>
            <span className="text-xs font-semibold">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
