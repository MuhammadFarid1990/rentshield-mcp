import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  seniorId: z.string().uuid(),
  message_text: z.string().min(1).max(2000),
  audio_url: z.string().url().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { error } = await supabase.from("family_voice_messages").insert({
    senior_id: parsed.data.seniorId,
    sender_user_id: user.id,
    message_text: parsed.data.message_text,
    audio_url: parsed.data.audio_url ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const seniorId = searchParams.get("seniorId");
  if (!seniorId) return NextResponse.json({ error: "seniorId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("family_voice_messages")
    .select("*, sender:users(full_name)")
    .eq("senior_id", seniorId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}
