import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { buildDailyBriefingPrompt } from "@/lib/ai/prompts/briefing";
import { startOfDay, endOfDay } from "date-fns";
import { z } from "zod";

const schema = z.object({ seniorId: z.string().uuid() });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { seniorId } = parsed.data;
  const today = new Date();

  const [{ data: senior }, { data: events }] = await Promise.all([
    supabase
      .from("seniors")
      .select("preferred_name, user:users(full_name), primary_language")
      .eq("id", seniorId)
      .single(),
    supabase
      .from("calendar_events")
      .select("*")
      .eq("senior_id", seniorId)
      .gte("scheduled_at", startOfDay(today).toISOString())
      .lte("scheduled_at", endOfDay(today).toISOString())
      .eq("is_cancelled", false)
      .order("scheduled_at"),
  ]);

  const name = senior?.preferred_name ?? (senior?.user as { full_name: string })?.full_name ?? "Friend";
  const tz = "America/New_York";

  const prompt = buildDailyBriefingPrompt(name, events ?? [], tz);
  const ai = getAIProvider();
  const result = await ai.complete({
    system: "You are a caring senior care AI companion. Generate the briefing exactly as instructed.",
    messages: [{ role: "user", content: prompt }],
    maxTokens: 256,
  });

  return NextResponse.json({ briefing: result.text });
}
