"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/home", label: "Home", emoji: "🏠" },
  { href: "/talk", label: "Talk", emoji: "🎙️" },
  { href: "/today", label: "Today", emoji: "📅" },
  { href: "/help", label: "Help", emoji: "🆘" },
];

export function SeniorBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="bg-white border-t-2 border-gray-200 px-2 py-2 flex justify-around sticky bottom-0 z-10"
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map(({ href, label, emoji }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            aria-label={isActive ? `${label} (current page)` : label}
            className={cn(
              "flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors min-h-[56px] justify-center",
              isActive
                ? "bg-blue-100 text-blue-800 font-bold"
                : "text-gray-700 hover:bg-gray-100",
            )}
          >
            <span className="text-2xl" aria-hidden="true">{emoji}</span>
            <span className={cn("text-xs", isActive ? "font-bold" : "font-semibold")}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
