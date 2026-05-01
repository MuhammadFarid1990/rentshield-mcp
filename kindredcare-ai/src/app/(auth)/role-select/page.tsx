import Link from "next/link";

const roles = [
  {
    href: "/signup/senior",
    emoji: "👴",
    label: "I am a Senior",
    desc: "Set up your personal care companion with voice or typing",
    color: "bg-blue-700 hover:bg-blue-800",
  },
  {
    href: "/signup/guardian",
    emoji: "👨‍👩‍👧",
    label: "I am a Guardian / Family",
    desc: "Monitor and support your loved one from anywhere",
    color: "bg-teal-700 hover:bg-teal-800",
  },
  {
    href: "/signup/staff",
    emoji: "🏥",
    label: "I am Care Center Staff",
    desc: "Manage your seniors and coordinate care",
    color: "bg-indigo-700 hover:bg-indigo-800",
  },
];

export default function RoleSelectPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12 gap-8">
      <div className="text-center">
        <span className="text-6xl" aria-hidden="true">🤝</span>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Welcome to KindredCare AI</h1>
        <p className="text-xl text-gray-600 mt-2">Who are you?</p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-4">
        {roles.map(({ href, emoji, label, desc, color }) => (
          <Link
            key={href}
            href={href}
            className={`${color} text-white rounded-2xl p-6 flex items-center gap-4 shadow-md transition-colors`}
          >
            <span className="text-4xl flex-shrink-0" aria-hidden="true">{emoji}</span>
            <div>
              <p className="text-xl font-bold">{label}</p>
              <p className="text-blue-100 text-sm mt-1">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-gray-500 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-700 underline font-semibold">Sign in</Link>
      </p>
    </main>
  );
}
