import Link from "next/link";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", emoji: "📊" },
  { href: "/admin/centers", label: "Centers", emoji: "🏥" },
  { href: "/admin/users", label: "Users", emoji: "👥" },
  { href: "/admin/audit-logs", label: "Audit Logs", emoji: "📜" },
];

export function AdminShell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold">{title ?? "KindredCare AI — Admin"}</h1>
      </header>
      <div className="flex flex-1">
        <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 py-6 gap-1">
          {NAV_ITEMS.map(({ href, label, emoji }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-100 rounded-r-xl transition-colors font-medium"
            >
              <span className="text-xl">{emoji}</span>
              {label}
            </Link>
          ))}
        </aside>
        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
