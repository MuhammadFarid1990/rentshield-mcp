"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GuardianShell } from "@/components/layout/GuardianShell";
import type { Senior, User } from "@/types/domain";

export default function GuardianMessagesPage() {
  const [seniors, setSeniors] = useState<(Senior & { user: User })[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("guardians")
        .select("id")
        .eq("user_id", user.id)
        .single()
        .then(({ data: g }) => {
          if (!g) return;
          supabase
            .from("senior_guardian_links")
            .select("senior:seniors(*, user:users(full_name))")
            .eq("guardian_id", g.id)
            .then(({ data: links }) => {
              const list = (links ?? []).map((l) => l.senior as unknown as Senior & { user: User });
              setSeniors(list);
              setSelectedId(list[0]?.id ?? "");
            });
        });
    });
  }, []);

  async function send() {
    if (!selectedId || !text.trim()) return;
    setSending(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("family_voice_messages").insert({
      senior_id: selectedId,
      sender_user_id: user.id,
      message_text: text.trim(),
    });
    setText("");
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <GuardianShell title="Send a Message">
      <div className="flex flex-col gap-5 max-w-lg">
        <p className="text-gray-600">Send a short, caring message that your loved one can play on their device.</p>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-gray-700">Send to</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="border-2 border-gray-300 rounded-xl px-4 py-2.5 focus:border-teal-500"
          >
            {seniors.map((s) => (
              <option key={s.id} value={s.id}>{s.preferred_name ?? s.user?.full_name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-gray-700">Your Message</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="e.g. Hi Mom, I'll call you after lunch. Have a great day!"
            className="border-2 border-gray-300 rounded-xl px-4 py-2.5 focus:border-teal-500 resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 text-right">{text.length}/500</p>
        </div>

        <button
          onClick={send}
          disabled={!selectedId || !text.trim() || sending}
          className="bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white py-3 rounded-xl font-bold"
        >
          {sending ? "Sending…" : sent ? "✓ Sent!" : "Send Message"}
        </button>

        <p className="text-xs text-gray-500">Messages are stored privately and only your loved one can see them.</p>
      </div>
    </GuardianShell>
  );
}
