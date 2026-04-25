"use client";

import type { ConversationTurn } from "@/hooks/useVoiceConversation";
import { cn } from "@/lib/utils/cn";
import { useEffect, useRef } from "react";

interface TranscriptViewProps {
  turns: ConversationTurn[];
  interimTranscript?: string;
}

export function TranscriptView({ turns, interimTranscript }: TranscriptViewProps) {
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
      {turns.map((turn) => (
        <div
          key={turn.id}
          className={cn(
            "max-w-[85%] rounded-2xl px-5 py-3 shadow-sm",
            turn.role === "user"
              ? "self-end bg-blue-700 text-white"
              : "self-start bg-white border-2 border-gray-200 text-gray-900",
          )}
        >
          <p className="text-senior-base leading-relaxed">{turn.text}</p>
        </div>
      ))}

      {interimTranscript && (
        <div className="max-w-[85%] self-end rounded-2xl px-5 py-3 bg-blue-200 text-blue-900 opacity-70">
          <p className="text-senior-base italic">{interimTranscript}…</p>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
