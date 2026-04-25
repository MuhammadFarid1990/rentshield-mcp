import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { routeConfirmedAction } from "@/lib/intents/router";
import { z } from "zod";

const schema = z.object({
  intent: z.object({
    intent: z.string(),
    entities: z.record(z.unknown()),
  }),
  seniorId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { intent, seniorId } = parsed.data;

  const { data: prefs } = await supabase
    .from("senior_preferences")
    .select("*")
    .eq("senior_id", seniorId)
    .single();

  const result = await routeConfirmedAction(
    {
      intent: intent.intent as never,
      entities: intent.entities,
      seniorId,
      confirmedBy: user.id,
    },
    supabase,
    prefs ?? null,
  );

  return NextResponse.json(result);
}
