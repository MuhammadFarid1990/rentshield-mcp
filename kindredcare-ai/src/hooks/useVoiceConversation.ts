"use client";

import { useCallback, useRef, useState } from "react";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import type { IntentResult } from "@/types/intents";

export type ConversationStatus =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "awaiting_confirmation"
  | "error";

export interface ConversationTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  intent?: IntentResult;
}

export interface UseVoiceConversationReturn {
  status: ConversationStatus;
  turns: ConversationTurn[];
  currentTranscript: string;
  pendingIntent: IntentResult | null;
  startListening: () => void;
  stopAndSubmit: () => void;
  submitText: (text: string) => void;
  confirmAction: (confirmed: boolean) => void;
  clearHistory: () => void;
  clearEmergency: () => void;
  error: string | null;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

export function useVoiceConversation(
  seniorId: string,
  voiceSpeed = 1.0,
  language = "en-US",
): UseVoiceConversationReturn {
  const [status, setStatus] = useState<ConversationStatus>("idle");
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [pendingIntent, setPendingIntent] = useState<IntentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const lastConversationIdRef = useRef<string | null>(null);

  const { transcript, interimTranscript, isListening, startListening: startSTT, stopListening, resetTranscript } =
    useSpeechRecognition(language);
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis(voiceSpeed);

  const addTurn = (role: "user" | "assistant", text: string, intent?: IntentResult) => {
    const turn: ConversationTurn = {
      id: crypto.randomUUID(),
      role,
      text,
      timestamp: new Date(),
      intent,
    };
    setTurns((prev) => [...prev, turn]);
    historyRef.current = [
      ...historyRef.current.slice(-8),
      { role, content: text },
    ];
    return turn;
  };

  const processTranscript = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      addTurn("user", text);
      setStatus("thinking");

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: text,
            seniorId,
            history: historyRef.current.slice(-6),
          }),
        });

        if (!res.ok) throw new Error("AI request failed");

        const { replyText, intent, conversationId } = await res.json();
        lastConversationIdRef.current = conversationId ?? null;

        addTurn("assistant", replyText, intent);

        if (intent?.isEmergency) {
          setStatus("idle");
          speak(replyText);
          return;
        }

        if (intent?.requiresConfirmation && intent?.confirmationPrompt) {
          setPendingIntent(intent);
          setStatus("awaiting_confirmation");
          speak(intent.confirmationPrompt);
        } else {
          setStatus("speaking");
          speak(replyText);
          setTimeout(() => setStatus("idle"), 500);
        }
      } catch (err) {
        setError("Sorry, I had trouble connecting. Please try again.");
        setStatus("error");
      }
    },
    [seniorId, speak],
  );

  const startListening = useCallback(() => {
    stopSpeaking();
    resetTranscript();
    setStatus("listening");
    startSTT();
  }, [stopSpeaking, resetTranscript, startSTT]);

  const stopAndSubmit = useCallback(() => {
    stopListening();
    const text = transcript.trim();
    resetTranscript();
    if (text) processTranscript(text);
    else setStatus("idle");
  }, [stopListening, transcript, resetTranscript, processTranscript]);

  const submitText = useCallback(
    (text: string) => {
      resetTranscript();
      processTranscript(text);
    },
    [resetTranscript, processTranscript],
  );

  const confirmAction = useCallback(
    async (confirmed: boolean) => {
      if (!pendingIntent) return;

      if (!confirmed) {
        setPendingIntent(null);
        setStatus("idle");
        const replyText = "Okay, I will not do that.";
        addTurn("assistant", replyText);
        speak(replyText);
        return;
      }

      setStatus("thinking");
      try {
        const res = await fetch("/api/intents/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: pendingIntent,
            seniorId,
            conversationId: lastConversationIdRef.current,
          }),
        });

        const { message } = await res.json();
        addTurn("assistant", message);
        speak(message);
      } catch {
        speak("Sorry, I could not complete that action.");
      }

      setPendingIntent(null);
      setStatus("idle");
    },
    [pendingIntent, seniorId, speak],
  );

  const clearHistory = useCallback(() => {
    setTurns([]);
    historyRef.current = [];
  }, []);

  const clearEmergency = useCallback(() => {
    setPendingIntent(null);
    setStatus("idle");
  }, []);

  return {
    status,
    turns,
    currentTranscript: isListening ? interimTranscript || transcript : "",
    pendingIntent,
    startListening,
    stopAndSubmit,
    submitText,
    confirmAction,
    clearHistory,
    clearEmergency,
    error,
    speak,
    stopSpeaking,
    isSpeaking,
  };
}
