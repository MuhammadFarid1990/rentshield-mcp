"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SeniorShell } from "@/components/layout/SeniorShell";
import { TranscriptView } from "@/components/voice/TranscriptView";
import { MicButton } from "@/components/voice/MicButton";
import { QuickActionRow } from "@/components/voice/QuickActionRow";
import { ConfirmAction } from "@/components/senior/ConfirmAction";
import { EmergencyPanel } from "@/components/senior/EmergencyPanel";
import { useVoiceConversation } from "@/hooks/useVoiceConversation";
import { cn } from "@/lib/utils/cn";
import type { Senior, EmergencyContact, Doctor } from "@/types/domain";

export default function TalkPage() {
  const [senior, setSenior] = useState<Senior | null>(null);
  const [typedInput, setTypedInput] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [centerPhone, setCenterPhone] = useState<string | null>(null);
  const [tapMode, setTapMode] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from("seniors")
        .select("*")
        .eq("user_id", data.user.id)
        .single()
        .then(async ({ data: s }) => {
          if (!s) return;
          setSenior(s);
          const [{ data: ec }, { data: docs }, { data: link }] = await Promise.all([
            supabase.from("emergency_contacts").select("*").eq("senior_id", s.id).order("sort_order"),
            supabase.from("doctors").select("*").eq("senior_id", s.id),
            supabase.from("senior_center_links").select("care_centers(phone)").eq("senior_id", s.id).eq("status", "active").maybeSingle(),
          ]);
          setContacts(ec ?? []);
          setDoctors(docs ?? []);
          const cc = link?.care_centers as
            | { phone?: string | null }
            | { phone?: string | null }[]
            | null
            | undefined;
          const phone = Array.isArray(cc) ? cc[0]?.phone ?? null : cc?.phone ?? null;
          setCenterPhone(phone);
        });
    });
  }, []);

  const {
    status,
    turns,
    currentTranscript,
    pendingIntent,
    startListening,
    stopAndSubmit,
    submitText,
    confirmAction,
    clearEmergency,
    error,
    speak,
    stopSpeaking,
    isSpeaking,
  } = useVoiceConversation(senior?.id ?? "", senior?.voice_speed ?? 1.0, senior?.primary_language ?? "en-US");

  // Auto-open help overlay when need_help intent is detected
  useEffect(() => {
    const last = turns[turns.length - 1];
    if (last?.role === "assistant" && last.intent?.intent === "need_help") {
      setShowHelp(true);
    }
  }, [turns]);

  const handleSend = () => {
    if (!typedInput.trim()) return;
    submitText(typedInput.trim());
    setTypedInput("");
  };

  const callEmergency = () => {
    window.location.href = "tel:911";
  };

  const dismissEmergency = () => {
    clearEmergency();
  };

  const handleRead = (text: string) => {
    if (isSpeaking) stopSpeaking();
    else speak(text);
  };

  if (!senior) {
    return (
      <SeniorShell title="Talk" showBack backHref="/home">
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <div>
            <p className="text-5xl mb-3" aria-hidden="true">⏳</p>
            <p className="text-senior-lg text-gray-700 font-semibold">
              Just a moment, getting things ready…
            </p>
          </div>
        </div>
      </SeniorShell>
    );
  }

  return (
    <SeniorShell title="Talk to KindredCare" showBack backHref="/home" highContrast={senior.high_contrast}>
      {/* Emergency escalation overlay */}
      {pendingIntent?.isEmergency ? (
        <div
          className="flex-1 flex flex-col p-4 gap-4"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4">
            <p className="text-senior-lg font-bold text-red-800 text-center">
              {pendingIntent.replyText}
            </p>
          </div>
          <button
            onClick={callEmergency}
            className="bg-red-600 hover:bg-red-700 text-white rounded-2xl py-6 text-senior-2xl font-bold shadow-lg active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-red-300"
            aria-label="Call 9 1 1 emergency services now"
          >
            📞 Call 911 Now
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl py-5 text-senior-xl font-bold focus:outline-none focus:ring-4 focus:ring-orange-300"
          >
            Show Emergency Contacts
          </button>
          <button
            onClick={dismissEmergency}
            className="bg-white border-2 border-gray-400 text-gray-800 rounded-2xl py-4 text-senior-lg font-bold hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300"
            aria-label="I'm okay — go back to talk"
          >
            ✅ I&apos;m okay, go back
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Transcript */}
          <TranscriptView
            turns={turns}
            interimTranscript={currentTranscript}
            onRead={handleRead}
            isSpeaking={isSpeaking}
          />

          {error && (
            <div className="mx-4 my-2 bg-red-50 border-2 border-red-300 rounded-xl p-3 text-red-700 text-senior-base font-semibold">
              {error}
            </div>
          )}

          {/* Confirmation */}
          {pendingIntent?.requiresConfirmation && pendingIntent.confirmationPrompt && (
            <div className="px-4 py-3">
              <ConfirmAction
                prompt={pendingIntent.confirmationPrompt}
                onConfirm={() => confirmAction(true)}
                onCancel={() => confirmAction(false)}
              />
            </div>
          )}

          {/* Input area */}
          <div className="bg-white border-t-2 border-gray-200 px-4 py-4 flex flex-col gap-4">
            {/* Quick action prompts — show whenever there's nothing in flight */}
            {!pendingIntent?.requiresConfirmation && (
              <QuickActionRow
                onSelect={(prompt) => submitText(prompt)}
                disabled={status === "thinking" || status === "listening"}
              />
            )}

            {/* Mic + mode toggle */}
            <div className="flex flex-col items-center gap-2">
              <MicButton
                status={status}
                onPress={startListening}
                onRelease={stopAndSubmit}
                tapMode={tapMode}
              />
              <button
                type="button"
                onClick={() => setTapMode((v) => !v)}
                aria-pressed={tapMode}
                className={cn(
                  "text-senior-sm font-semibold px-4 py-2 rounded-xl border-2",
                  "focus:outline-none focus:ring-4 focus:ring-blue-300",
                  tapMode
                    ? "bg-blue-50 border-blue-300 text-blue-800"
                    : "bg-gray-50 border-gray-300 text-gray-700",
                )}
              >
                {tapMode ? "Use hold mode (default)" : "Use tap mode instead"}
              </button>
            </div>

            {/* Typing */}
            <div className="flex flex-col gap-2">
              <label htmlFor="talk-input" className="text-senior-sm font-semibold text-gray-700">
                Or type your message
              </label>
              <div className="flex gap-2">
                <input
                  id="talk-input"
                  type="text"
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type here…"
                  className="flex-1 border-2 border-gray-300 rounded-2xl px-4 py-3 text-senior-base focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!typedInput.trim() || status === "thinking"}
                  className="bg-blue-700 text-white px-5 py-3 rounded-2xl text-senior-base font-bold disabled:opacity-50 hover:bg-blue-800 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
                  aria-label="Send message"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency help slide-over */}
      {showHelp && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="p-4">
            <button
              onClick={() => setShowHelp(false)}
              className="text-senior-lg font-bold text-gray-700 mb-4"
            >
              ← Back to Talk
            </button>
            <EmergencyPanel contacts={contacts} doctors={doctors} careCenterPhone={centerPhone} />
          </div>
        </div>
      )}
    </SeniorShell>
  );
}
