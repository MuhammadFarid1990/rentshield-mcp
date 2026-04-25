import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { QUICK_ADD_PRESETS } from "@/lib/constants";
import { z } from "zod";
import { format, setHours, setMinutes } from "date-fns";

const schema = z.object({
  presetId: z.string(),
  seniorId: z.string().uuid(),
  date: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { presetId, seniorId, date } = parsed.data;
  const preset = QUICK_ADD_PRESETS.find((p) => p.id === presetId);
  if (!preset) return NextResponse.json({ error: "Unknown preset" }, { status: 404 });

  const baseDate = date ? new Date(date) : new Date();
  const [h, m] = (preset.default_time ?? "09:00").split(":").map(Number);
  const scheduled = setMinutes(setHours(baseDate, h), m);

  const { error } = await supabase.from("calendar_events").insert({
    senior_id: seniorId,
    created_by: user.id,
    event_type: preset.event_type,
    title: preset.label,
    scheduled_at: scheduled.toISOString(),
    voice_alert: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, scheduledAt: scheduled.toISOString() });
}
