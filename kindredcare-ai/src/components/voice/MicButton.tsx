"use client";

import { cn } from "@/lib/utils/cn";
import type { ConversationStatus } from "@/hooks/useVoiceConversation";

interface MicButtonProps {
  status: ConversationStatus;
  onPress: () => void;
  onRelease: () => void;
  /** When true, behaves as a single tap-to-toggle button instead of push-and-hold. */
  tapMode?: boolean;
}

const statusConfig: Record<ConversationStatus, { bg: string; label: string; emoji: string; tapLabel: string }> = {
  idle: {
    bg: "bg-blue-700 hover:bg-blue-800",
    label: "Tap and hold to speak",
    tapLabel: "Tap to start speaking",
    emoji: "🎙️",
  },
  listening: {
    bg: "bg-red-500 animate-mic-pulse",
    label: "Listening… release to send",
    tapLabel: "Listening… tap to send",
    emoji: "🎤",
  },
  thinking: { bg: "bg-amber-500", label: "Thinking…", tapLabel: "Thinking…", emoji: "⏳" },
  speaking: { bg: "bg-teal-600", label: "Speaking…", tapLabel: "Speaking…", emoji: "🔊" },
  awaiting_confirmation: {
    bg: "bg-amber-600",
    label: "Waiting for your answer",
    tapLabel: "Waiting for your answer",
    emoji: "❓",
  },
  error: { bg: "bg-gray-500", label: "Try again", tapLabel: "Try again", emoji: "⚠️" },
};

export function MicButton({ status, onPress, onRelease, tapMode = false }: MicButtonProps) {
  const config = statusConfig[status];
  const isActive = status === "listening";
  const label = tapMode ? config.tapLabel : config.label;

  // Tap mode: single click toggles between starting and stopping the recording.
  const tapHandlers = tapMode
    ? {
        onClick: () => (isActive ? onRelease() : onPress()),
      }
    : {
        onPointerDown: onPress,
        onPointerUp: onRelease,
        onPointerLeave: isActive ? onRelease : undefined,
      };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        aria-label={label}
        aria-pressed={isActive}
        className={cn(
          "w-28 h-28 rounded-full flex items-center justify-center",
          "text-5xl text-white shadow-xl transition-all duration-150",
          "focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-blue-400",
          "active:scale-95 select-none",
          config.bg,
        )}
        {...tapHandlers}
      >
        {config.emoji}
      </button>
      <p className="text-senior-base text-gray-700 font-medium text-center">{label}</p>
    </div>
  );
}
