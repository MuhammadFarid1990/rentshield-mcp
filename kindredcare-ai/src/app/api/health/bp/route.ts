import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  seniorId: z.string().uuid(),
  systolic: z.number().int().min(40).max(260),
  diastolic: z.number().int().min(30).max(200),
  pulse: z.number().int().min(20).max(220).nullable().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { seniorId, systolic, diastolic, pulse, notes } = parsed.data;

  const { data: prefs } = await supabase
    .from("senior_preferences")
    .select("safe_range_bp_systolic_min, safe_range_bp_systolic_max, safe_range_bp_diastolic_min, safe_range_bp_diastolic_max")
    .eq("senior_id", seniorId)
    .single();

  const outOfRange = prefs
    ? systolic < prefs.safe_range_bp_systolic_min ||
      systolic > prefs.safe_range_bp_systolic_max ||
      diastolic < prefs.safe_range_bp_diastolic_min ||
      diastolic > prefs.safe_range_bp_diastolic_max
    : false;

  const { error } = await supabase.from("blood_pressure_records").insert({
    senior_id: seniorId, systolic, diastolic, pulse: pulse ?? null,
    notes: notes ?? null, recorded_by: user.id, source: "typed", out_of_range: outOfRange,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    outOfRange,
    message: outOfRange
      ? `Saved ${systolic}/${diastolic}. This reading is outside the normal range.`
      : `Saved ${systolic}/${diastolic}.`,
  });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const seniorId = searchParams.get("seniorId");
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  if (!seniorId) return NextResponse.json({ error: "seniorId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("blood_pressure_records")
    .select("*")
    .eq("senior_id", seniorId)
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ records: data });
}
