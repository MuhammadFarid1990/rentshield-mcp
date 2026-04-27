import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { z } from "zod";

const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

const patchSchema = z.object({
  med_name: z.string().min(1).max(200).optional(),
  dosage: z.string().min(1).max(50).optional(),
  dosage_unit: z.string().max(20).nullable().optional(),
  frequency: z.string().min(1).optional(),
  times: z.array(z.string().regex(HH_MM, "Times must be HH:MM (24-hour)")).min(1).max(8).optional(),
  instructions: z.string().max(500).nullable().optional(),
  start_date: z.string().optional(),
  end_date: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  notify_guardian: z.boolean().optional(),
  notify_center: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid", details: parsed.error.format() }, { status: 400 });

  const { data: existing } = await supabase
    .from("medication_schedules")
    .select("senior_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("medication_schedules")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit(supabase, user.id, existing.senior_id, "medication.update", { id, fields: Object.keys(parsed.data) });
  return NextResponse.json({ schedule: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("medication_schedules")
    .select("senior_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error } = await supabase
    .from("medication_schedules")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit(supabase, user.id, existing.senior_id, "medication.deactivate", { id });
  return NextResponse.json({ success: true });
}
