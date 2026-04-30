import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { orchestrate } from "@/lib/ai/orchestrator";
import { logAudit } from "@/lib/audit/log";
import { z } from "zod";

const schema = z.object({
  transcript: z.string().min(1).max(2000),
  seniorId: z.string().uuid(),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).max(8).default([]),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { transcript, seniorId, history } = parsed.data;

  const [{ data: senior }, { data: prefs }] = await Promise.all([
    supabase
      .from("seniors")
      .select("*, user:users(full_name)")
      .eq("id", seniorId)
      .single(),
    supabase
      .from("senior_preferences")
      .select("*")
      .eq("senior_id", seniorId)
      .single(),
  ]);

  if (!senior) {
    return NextResponse.json({ error: "Senior not found" }, { status: 404 });
  }

  const { data: userRecord } = await supabase
    .from("users")
    .select("timezone")
    .eq("id", user.id)
    .single();

  const timezone = userRecord?.timezone ?? "America/New_York";

  const result = await orchestrate({
    transcript,
    senior,
    prefs: prefs ?? null,
    conversationHistory: history,
    supabase,
    timezone,
  });

  // Persist conversation; capture id so we can mark action_confirmed on follow-up.
  const { data: convo } = await supabase
    .from("voice_conversations")
    .insert({
      senior_id: seniorId,
      transcript,
      ai_reply: result.replyText,
      intent: result.intent.intent,
      action_taken: null,
      action_confirmed: false,
      safety_flag: result.intent.safetyFlag,
      safety_reason: result.intent.safetyReason ?? null,
    })
    .select("id")
    .single();

  await logAudit(supabase, user.id, seniorId, "ai_chat", {
    intent: result.intent.intent,
    safetyFlag: result.intent.safetyFlag,
    hallucinationRisk: result.hallucinationRisk,
  });

  return NextResponse.json({
    replyText: result.replyText,
    intent: result.intent,
    hallucinationRisk: result.hallucinationRisk,
    conversationId: convo?.id ?? null,
  });
}
