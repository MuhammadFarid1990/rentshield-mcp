"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SeniorShell } from "@/components/layout/SeniorShell";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { format, parseISO } from "date-fns";
import type { FamilyVoiceMessage } from "@/types/domain";

export default function FamilyMessagesPage() {
  const [seniorId, setSeniorId] = useState<string | null>(null);
  const [messages, setMessages] = useState<FamilyVoiceMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { speak } = useSpeechSynthesis(0.9);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("seniors").select("id").eq("user_id", data.user.id).single().then(({ data: s }) => {
        if (!s) return;
        setSeniorId(s.id);
        supabase
          .from("family_voice_messages")
          .select("*, sender:users(full_name)")
          .eq("senior_id", s.id)
          .order("created_at", { ascending: false })
          .limit(20)
          .then(({ data: msgs }) => {
            setMessages((msgs as FamilyVoiceMessage[]) ?? []);
            setLoading(false);
          });
      });
    });
  }, []);

  async function markRead(messageId: string) {
    const supabase = createClient();
    await supabase.from("family_voice_messages").update({ is_read: true, read_at: new Date().toISOString() }).eq("id", messageId);
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, is_read: true } : m)));
  }

  return (
    <SeniorShell title="Family Messages" showBack backHref="/home">
      <div className="px-4 py-4 flex flex-col gap-4">
        {loading && <p className="text-senior-base text-gray-500 text-center">Loading…</p>}

        {!loading && messages.length === 0 && (
          <div className="text-center bg-white border-2 border-gray-200 rounded-2xl p-8">
            <p className="text-5xl mb-3">💌</p>
            <p className="text-senior-lg text-gray-600">No messages from your family yet.</p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-5 rounded-2xl border-2 flex flex-col gap-3 ${
              m.is_read ? "border-gray-200 bg-white" : "border-blue-300 bg-blue-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-bold text-senior-base text-gray-900">
                From {m.sender?.full_name ?? "Family"}
              </p>
              {!m.is_read && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>
              )}
            </div>
            <p className="text-senior-base text-gray-800 leading-relaxed">{m.message_text}</p>
            <p className="text-senior-sm text-gray-500">{format(parseISO(m.created_at), "MMMM d, h:mm a")}</p>
            <div className="flex gap-2">
              <button
                onClick={() => speak(m.message_text)}
                className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-bold text-senior-base hover:bg-blue-800"
              >
                🔊 Play Message
              </button>
              {!m.is_read && (
                <button
                  onClick={() => markRead(m.id)}
                  className="bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold text-senior-base"
                >
                  ✓ Mark Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </SeniorShell>
  );
}
