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
import type { Senior, EmergencyContact, Doctor } from "@/types/domain";

export default function TalkPage() {
  const [senior, setSenior] = useState<Senior | null>(null);
  const [typedInput, setTypedInput] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [centerPhone, setCenterPhone] = useState<string | null>(null);

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
    error,
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

  if (!senior) {
    return (
      <SeniorShell title="Talk" showBack backHref="/home">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-senior-lg text-gray-500">Loading…</p>
        </div>
      </SeniorShell>
    );
  }

  return (
    <SeniorShell title="Talk to KindredCare" showBack backHref="/home" highContrast={senior.high_contrast}>
      {/* Emergency escalation overlay */}
      {pendingIntent?.isEmergency ? (
        <div className="flex-1 flex flex-col p-4 gap-4">
          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4">
            <p className="text-senior-lg font-bold text-red-800 text-center">
              {pendingIntent.replyText}
            </p>
          </div>
          <button onClick={() => setShowHelp(true)} className="bg-red-600 text-white rounded-2xl py-5 text-senior-xl font-bold">
            Show Emergency Contacts
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Transcript */}
          <TranscriptView turns={turns} interimTranscript={currentTranscript} />

          {error && (
            <div className="mx-4 my-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-base">
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
            {/* Quick action prompts */}
            {!pendingIntent && (
              <QuickActionRow
                onSelect={(prompt) => submitText(prompt)}
                disabled={status === "thinking" || status === "listening"}
              />
            )}

            {/* Mic */}
            <div className="flex justify-center">
              <MicButton
                status={status}
                onPress={startListening}
                onRelease={stopAndSubmit}
              />
            </div>

            {/* Typing */}
            <div className="flex gap-2">
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Or type here…"
                className="flex-1 border-2 border-gray-300 rounded-2xl px-4 py-3 text-senior-base focus:border-blue-500 focus:outline-none"
                aria-label="Type your message"
              />
              <button
                onClick={handleSend}
                disabled={!typedInput.trim() || status === "thinking"}
                className="bg-blue-700 text-white px-5 py-3 rounded-2xl text-senior-base font-bold disabled:opacity-50 hover:bg-blue-800 transition-colors"
                aria-label="Send message"
              >
                Send
              </button>
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
