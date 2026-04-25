import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface TriadButtonProps {
  href: string;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

function TriadButton({ href, label, emoji, color, description }: TriadButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        "min-h-[140px] rounded-3xl p-6 shadow-lg",
        "transition-all duration-150 active:scale-95",
        "focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-blue-400",
        "text-white font-bold text-center",
        color,
      )}
      aria-label={`${label}: ${description}`}
    >
      <span className="text-5xl" aria-hidden="true">{emoji}</span>
      <span className="text-senior-2xl">{label}</span>
      <span className="text-senior-sm font-normal opacity-90">{description}</span>
    </Link>
  );
}

export function HomeTriad({ seniorName }: { seniorName: string }) {
  const firstName = seniorName.split(" ")[0];

  return (
    <div className="flex flex-col gap-1 px-4 py-2">
      <h1 className="text-senior-2xl font-bold text-gray-800 text-center mb-4">
        Hello, {firstName}
      </h1>
      <div className="grid grid-cols-1 gap-5">
        <TriadButton
          href="/talk"
          label="Talk"
          emoji="🎙️"
          color="bg-blue-700 hover:bg-blue-800"
          description="Speak or type to your care companion"
        />
        <TriadButton
          href="/today"
          label="Today"
          emoji="📅"
          color="bg-teal-700 hover:bg-teal-800"
          description="See your reminders and schedule"
        />
        <TriadButton
          href="/help"
          label="Help"
          emoji="🆘"
          color="bg-red-600 hover:bg-red-700"
          description="Emergency contacts and quick help"
        />
      </div>
    </div>
  );
}
