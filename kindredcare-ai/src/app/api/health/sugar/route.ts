import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  seniorId: z.string().uuid(),
  value: z.number().min(20).max(700),
  unit: z.string().default("mg/dL"),
  measurement_context: z.enum(["fasting", "after_meal", "before_meal", "random"]).optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { seniorId, value, unit, measurement_context, notes } = parsed.data;

  const { data: prefs } = await supabase
    .from("senior_preferences")
    .select("safe_range_blood_sugar_min, safe_range_blood_sugar_max")
    .eq("senior_id", seniorId)
    .single();

  const outOfRange = prefs
    ? value < prefs.safe_range_blood_sugar_min || value > prefs.safe_range_blood_sugar_max
    : false;

  const { error } = await supabase.from("blood_sugar_records").insert({
    senior_id: seniorId, value, unit, measurement_context: measurement_context ?? null,
    notes: notes ?? null, recorded_by: user.id, source: "typed", out_of_range: outOfRange,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, outOfRange });
}
