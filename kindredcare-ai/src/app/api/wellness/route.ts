import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  seniorId: z.string().uuid(),
  mood: z.enum(["great", "good", "okay", "lonely", "sad", "anxious", "unwell"]).optional(),
  sleep_quality: z.enum(["great", "good", "fair", "poor"]).optional(),
  water_intake_oz: z.number().int().min(0).max(300).optional(),
  meals_eaten: z.number().int().min(0).max(6).optional(),
  energy_level: z.enum(["high", "medium", "low"]).optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const d = parsed.data;
  const { error } = await supabase.from("wellness_checkins").insert({
    senior_id: d.seniorId,
    mood: d.mood ?? null,
    sleep_quality: d.sleep_quality ?? null,
    water_intake_oz: d.water_intake_oz ?? null,
    meals_eaten: d.meals_eaten ?? null,
    energy_level: d.energy_level ?? null,
    notes: d.notes ?? null,
    source: "typed",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
