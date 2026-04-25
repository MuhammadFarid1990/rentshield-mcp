"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BigButton } from "@/components/senior/BigButton";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface SignupStep {
  field: string;
  question: string;
  type: "text" | "number" | "time" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

const STEPS: SignupStep[] = [
  { field: "full_name", question: "What is your full name?", type: "text", placeholder: "Mary Johnson" },
  { field: "age", question: "How old are you?", type: "number", placeholder: "75" },
  {
    field: "primary_language",
    question: "What language do you prefer?",
    type: "select",
    options: [
      { value: "en", label: "English" },
      { value: "es", label: "Spanish" },
      { value: "fr", label: "French" },
      { value: "zh", label: "Chinese" },
      { value: "tl", label: "Tagalog" },
    ],
  },
  {
    field: "response_style",
    question: "How would you like me to talk to you?",
    type: "select",
    options: [
      { value: "friendly", label: "Friendly and warm" },
      { value: "formal", label: "Formal and proper" },
      { value: "short", label: "Short and simple" },
      { value: "calm", label: "Calm and gentle" },
    ],
  },
  { field: "wake_time", question: "What time do you usually wake up?", type: "time" },
  { field: "breakfast_time", question: "What time is your breakfast?", type: "time" },
  { field: "lunch_time", question: "What time is your lunch?", type: "time" },
  { field: "dinner_time", question: "What time is your dinner?", type: "time" },
  { field: "sleep_time", question: "What time do you usually go to sleep?", type: "time" },
  { field: "email", question: "What is your email address for sign-in?", type: "text", placeholder: "mary@example.com" },
  { field: "password", question: "Choose a password (at least 8 characters).", type: "text", placeholder: "••••••••" },
];

export default function SeniorSignupPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { speak } = useSpeechSynthesis(0.85);
  const { transcript, isListening, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  const currentStep = STEPS[step];

  const handleSpeak = () => speak(currentStep.question);

  const handleNext = async () => {
    if (!current.trim()) return;
    const updated = { ...answers, [currentStep.field]: current.trim() };
    setAnswers(updated);
    setCurrent("");
    resetTranscript();

    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      setTimeout(() => speak(STEPS[step + 1].question), 300);
    } else {
      await handleSubmit(updated);
    }
  };

  const handleSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name, role: "senior" },
      },
    });

    if (authError || !authData.user) {
      setError(authError?.message ?? "Could not create account.");
      setLoading(false);
      return;
    }

    // Create senior profile
    await supabase.from("seniors").insert({
      user_id: authData.user.id,
      age: parseInt(data.age) || null,
      primary_language: data.primary_language || "en",
      response_style: data.response_style || "friendly",
      wake_time: data.wake_time || null,
      breakfast_time: data.breakfast_time || null,
      lunch_time: data.lunch_time || null,
      dinner_time: data.dinner_time || null,
      sleep_time: data.sleep_time || null,
    });

    speak("Welcome to KindredCare AI! Your account is ready. Let me take you home.");
    setTimeout(() => router.push("/home"), 2000);
  };

  // Sync voice transcript to input
  if (transcript && transcript !== current && !isListening) {
    setCurrent(transcript);
    resetTranscript();
  }

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <main className="senior-shell min-h-screen bg-blue-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-6 flex flex-col gap-6">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="flex items-start gap-3">
          <p className="text-senior-xl font-semibold text-gray-900 flex-1">{currentStep.question}</p>
          <button
            onClick={handleSpeak}
            aria-label="Read question aloud"
            className="text-2xl p-2 rounded-xl hover:bg-blue-50 flex-shrink-0"
          >
            🔊
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 text-red-700">
            {error}
          </div>
        )}

        {/* Input */}
        {currentStep.type === "select" ? (
          <div className="flex flex-col gap-2">
            {currentStep.options?.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setCurrent(opt.value); }}
                className={`w-full py-4 px-5 rounded-2xl border-2 text-lg font-semibold text-left transition-colors ${
                  current === opt.value
                    ? "border-blue-600 bg-blue-50 text-blue-800"
                    : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <input
            type={currentStep.type === "text" ? (currentStep.field === "password" ? "password" : "text") : currentStep.type}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder={currentStep.placeholder}
            className="border-2 border-gray-300 rounded-2xl px-5 py-4 text-senior-base focus:border-blue-500 focus:outline-none w-full"
            aria-label={currentStep.question}
          />
        )}

        {/* Voice input */}
        <div className="flex gap-3">
          <button
            onPointerDown={() => { resetTranscript(); startListening(); }}
            onPointerUp={() => { stopListening(); if (transcript) setCurrent(transcript); }}
            className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${
              isListening
                ? "bg-red-500 text-white animate-mic-pulse"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isListening ? "🎤 Listening…" : "🎙️ Hold to Speak"}
          </button>
        </div>

        <BigButton onClick={handleNext} disabled={!current.trim() || loading} size="xl">
          {loading ? "Setting up…" : step < STEPS.length - 1 ? "Next →" : "Create My Account"}
        </BigButton>
      </div>
    </main>
  );
}
