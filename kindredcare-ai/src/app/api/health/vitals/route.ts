import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  seniorId: z.string().uuid(),
  pulse: z.number().int().nullable().optional(),
  weight_lbs: z.number().nullable().optional(),
  temperature_f: z.number().nullable().optional(),
  pain_level: z.number().int().min(0).max(10).nullable().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { error } = await supabase.from("health_check_records").insert({
    senior_id: parsed.data.seniorId,
    pulse: parsed.data.pulse ?? null,
    weight_lbs: parsed.data.weight_lbs ?? null,
    temperature_f: parsed.data.temperature_f ?? null,
    pain_level: parsed.data.pain_level ?? null,
    notes: parsed.data.notes ?? null,
    recorded_by: user.id,
    source: "typed",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
