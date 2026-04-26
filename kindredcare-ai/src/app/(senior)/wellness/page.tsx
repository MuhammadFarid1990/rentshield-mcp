"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { SeniorShell } from "@/components/layout/SeniorShell";
import { BigButton } from "@/components/senior/BigButton";
import { MOOD_OPTIONS } from "@/lib/constants";

export default function WellnessCheckinPage() {
  const [seniorId, setSeniorId] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [sleepQuality, setSleepQuality] = useState<string | null>(null);
  const [meals, setMeals] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from("seniors").select("id").eq("user_id", data.user.id).single().then(({ data: s }) => {
          if (s) setSeniorId(s.id);
        });
      }
    });
  }, []);

  async function handleSubmit() {
    if (!seniorId || !mood) return;
    const supabase = createClient();
    await supabase.from("wellness_checkins").insert({
      senior_id: seniorId,
      mood,
      sleep_quality: sleepQuality,
      meals_eaten: meals,
      source: "typed",
    });
    setSubmitted(true);
    setTimeout(() => router.push("/home"), 2000);
  }

  if (submitted) {
    return (
      <SeniorShell title="Wellness Check-In" showBack backHref="/home">
        <div className="flex flex-col items-center justify-center flex-1 text-center px-6 gap-4">
          <span className="text-7xl">🌟</span>
          <p className="text-senior-2xl font-bold text-gray-900">Thank you!</p>
          <p className="text-senior-base text-gray-600">Your check-in has been saved.</p>
        </div>
      </SeniorShell>
    );
  }

  return (
    <SeniorShell title="Wellness Check-In" showBack backHref="/home">
      <div className="px-4 py-4 flex flex-col gap-6">
        <p className="text-senior-lg text-gray-800 text-center">How are you feeling today?</p>

        <div className="flex flex-col gap-3">
          <p className="text-senior-base font-semibold text-gray-700">Mood</p>
          <div className="grid grid-cols-2 gap-2">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-colors ${
                  mood === m.value ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-senior-base font-semibold text-gray-800">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-senior-base font-semibold text-gray-700">How did you sleep?</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "great", label: "Great" },
              { value: "good", label: "Good" },
              { value: "fair", label: "Fair" },
              { value: "poor", label: "Poor" },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setSleepQuality(s.value)}
                className={`p-4 rounded-2xl border-2 text-senior-base font-semibold ${
                  sleepQuality === s.value ? "border-blue-600 bg-blue-50 text-blue-800" : "border-gray-200 bg-white text-gray-800"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-senior-base font-semibold text-gray-700">How many meals so far?</p>
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setMeals(n)}
                className={`p-4 rounded-2xl border-2 text-senior-lg font-bold ${
                  meals === n ? "border-blue-600 bg-blue-50 text-blue-800" : "border-gray-200 bg-white text-gray-800"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <BigButton size="xl" onClick={handleSubmit} disabled={!mood}>
          Save Check-In
        </BigButton>
      </div>
    </SeniorShell>
  );
}
