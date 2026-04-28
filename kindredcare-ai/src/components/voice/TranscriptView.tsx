"use client";

import type { ConversationTurn } from "@/hooks/useVoiceConversation";
import { cn } from "@/lib/utils/cn";
import { useEffect, useRef } from "react";

interface TranscriptViewProps {
  turns: ConversationTurn[];
  interimTranscript?: string;
  /** Called when the user taps Read again on any assistant turn. */
  onRead?: (text: string) => void;
  /** When true, Read again buttons show in "stop" state. */
  isSpeaking?: boolean;
}

export function TranscriptView({
  turns,
  interimTranscript,
  onRead,
  isSpeaking,
}: TranscriptViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, interimTranscript]);

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-4"
      aria-live="polite"
      aria-label="Conversation"
      role="log"
    >
      {turns.map((turn) => {
        const isUser = turn.role === "user";
        return (
          <div
            key={turn.id}
            className={cn(
              "flex flex-col gap-1 max-w-[85%]",
              isUser ? "self-end items-end" : "self-start items-start",
            )}
          >
            <span
              className={cn(
                "text-senior-sm font-semibold uppercase tracking-wide",
                isUser ? "text-blue-700" : "text-teal-700",
              )}
            >
              {isUser ? "You" : "KindredCare"}
            </span>
            <div
              className={cn(
                "rounded-2xl px-5 py-3 shadow-sm",
                isUser
                  ? "bg-blue-700 text-white"
                  : "bg-white border-2 border-gray-200 text-gray-900",
              )}
            >
              <p className="text-senior-base leading-relaxed">{turn.text}</p>
            </div>
            {!isUser && onRead && (
              <button
                type="button"
                onClick={() => onRead(turn.text)}
                aria-label={isSpeaking ? "Stop reading" : "Read this reply again"}
                className={cn(
                  "mt-1 text-senior-sm font-semibold px-3 py-2 rounded-xl",
                  "border-2 border-teal-300 text-teal-800 hover:bg-teal-50",
                  "focus:outline-none focus:ring-4 focus:ring-teal-200",
                )}
              >
                {isSpeaking ? "⏹️ Stop reading" : "🔊 Read again"}
              </button>
            )}
          </div>
        );
      })}

      {interimTranscript && (
        <div className="flex flex-col gap-1 max-w-[85%] self-end items-end">
          <span className="text-senior-sm font-semibold uppercase tracking-wide text-blue-700">
            You
          </span>
          <div className="rounded-2xl px-5 py-3 bg-blue-200 text-blue-900 opacity-70">
            <p className="text-senior-base italic">{interimTranscript}…</p>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
