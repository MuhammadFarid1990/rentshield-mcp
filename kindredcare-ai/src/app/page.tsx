import Link from "next/link";
import { APP_NAME, APP_TAGLINE, DISCLAIMER } from "@/lib/constants";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-blue-700 to-blue-900 text-white">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 gap-6">
        <span className="text-8xl" aria-hidden="true">🤝</span>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">{APP_NAME}</h1>
        <p className="text-xl md:text-2xl max-w-xl text-blue-100">{APP_TAGLINE}</p>
        <p className="text-lg text-blue-200 max-w-2xl">
          Voice and typing-based senior care companion. Connecting seniors, families, and care centers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-sm">
          <Link
            href="/role-select"
            className="bg-white text-blue-800 font-bold text-xl px-8 py-5 rounded-2xl hover:bg-blue-50 transition-colors text-center shadow-lg"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="border-2 border-white text-white font-bold text-xl px-8 py-5 rounded-2xl hover:bg-blue-800 transition-colors text-center"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Value props */}
      <section className="bg-white/10 backdrop-blur px-6 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: "🎙️", title: "Voice & Typing", desc: "Seniors can speak or type naturally. The app listens and responds." },
            { emoji: "👨‍👩‍👧", title: "Care Circle", desc: "Family, doctors, and care centers all connected with real-time visibility." },
            { emoji: "🛡️", title: "Safe & Private", desc: "Role-based access, encrypted data, no medical diagnosis." },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="text-center flex flex-col items-center gap-2">
              <span className="text-4xl">{emoji}</span>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-blue-100">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-blue-200 text-sm px-6 py-4 flex flex-col gap-1">
        <p>{DISCLAIMER}</p>
        <p>Your health data stays private. Role-based access. We never share with third parties.</p>
      </footer>
    </main>
  );
}
