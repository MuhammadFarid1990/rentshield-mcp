import Link from "next/link";
import type { ReactNode } from "react";

interface CenterShellProps {
  children: ReactNode;
  title?: string;
}

const NAV_ITEMS = [
  { href: "/center/monitoring", label: "Dashboard", emoji: "📊" },
  { href: "/center/attention", label: "Attention", emoji: "🚨" },
  { href: "/center/seniors", label: "Seniors", emoji: "👥" },
  { href: "/center/activities", label: "Activities", emoji: "🎯" },
  { href: "/center/visits", label: "Visits", emoji: "📅" },
  { href: "/center/transportation", label: "Transport", emoji: "🚗" },
  { href: "/center/alerts", label: "Alerts", emoji: "🔔" },
];

export function CenterShell({ children, title }: CenterShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-indigo-700 text-white px-6 py-4 shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold">{title ?? "KindredCare AI — Care Center"}</h1>
      </header>
      <div className="flex flex-1">
        <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 py-6 gap-1">
          {NAV_ITEMS.map(({ href, label, emoji }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-800 rounded-r-xl transition-colors font-medium"
            >
              <span className="text-xl">{emoji}</span>
              {label}
            </Link>
          ))}
        </aside>
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">{children}</main>
      </div>
      <nav className="md:hidden bg-white border-t border-gray-200 flex justify-around py-2 overflow-x-auto">
        {NAV_ITEMS.map(({ href, label, emoji }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-3 py-2 text-gray-600 hover:text-indigo-700 text-xs flex-shrink-0">
            <span className="text-xl">{emoji}</span>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
