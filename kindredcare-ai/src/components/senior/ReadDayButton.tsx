"use client";

import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface ReadDayButtonProps {
  briefingText: string;
  voiceSpeed?: number;
  language?: string;
}

export function ReadDayButton({ briefingText, voiceSpeed = 0.95, language = "en-US" }: ReadDayButtonProps) {
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis(voiceSpeed, 1.0, language);

  if (!isSupported) return null;

  const handleClick = () => {
    if (isSpeaking) stop();
    else speak(briefingText);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-2xl py-4 px-5 flex items-center justify-center gap-3 text-senior-lg font-bold shadow-md transition-colors active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
      aria-label={isSpeaking ? "Stop reading" : "Read my day aloud"}
    >
      <span className="text-3xl" aria-hidden="true">{isSpeaking ? "⏹️" : "🔊"}</span>
      {isSpeaking ? "Stop reading" : "Read my day"}
    </button>
  );
}
