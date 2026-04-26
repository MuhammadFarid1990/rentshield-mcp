import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createSchema = z.object({
  seniorId: z.string().uuid(),
  med_name: z.string().min(1).max(200),
  dosage: z.string().min(1).max(50),
  dosage_unit: z.string().max(20).optional(),
  frequency: z.string().min(1),
  times: z.array(z.string()).min(1).max(8),
  instructions: z.string().max(500).optional(),
  start_date: z.string().optional(),
  end_date: z.string().nullable().optional(),
  notify_guardian: z.boolean().default(true),
  notify_center: z.boolean().default(false),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid", details: parsed.error.format() }, { status: 400 });

  const d = parsed.data;
  const { error, data } = await supabase.from("medication_schedules").insert({
    senior_id: d.seniorId,
    created_by: user.id,
    med_name: d.med_name,
    dosage: d.dosage,
    dosage_unit: d.dosage_unit ?? null,
    frequency: d.frequency,
    times: d.times,
    instructions: d.instructions ?? null,
    start_date: d.start_date ?? new Date().toISOString().slice(0, 10),
    end_date: d.end_date ?? null,
    notify_guardian: d.notify_guardian,
    notify_center: d.notify_center,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ schedule: data });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const seniorId = searchParams.get("seniorId");
  if (!seniorId) return NextResponse.json({ error: "seniorId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("medication_schedules")
    .select("*")
    .eq("senior_id", seniorId)
    .order("med_name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ schedules: data });
}
