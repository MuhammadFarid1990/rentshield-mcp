import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { SeniorBottomNav } from "./SeniorBottomNav";
import { AccessibilityProvider } from "@/components/senior/AccessibilityToggle";

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
      {/* Apply user-saved accessibility preferences (text size, contrast) */}
      <AccessibilityProvider initialContrast={highContrast} />

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

      <SeniorBottomNav />
    </div>
  );
}
