import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { z } from "zod";

const patchSchema = z.object({
  full_name: z.string().min(1).max(200).optional(),
  specialty: z.string().max(100).nullable().optional(),
  clinic_name: z.string().max(200).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  office_hours: z.string().max(200).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  is_primary: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid", details: parsed.error.format() }, { status: 400 });

  const { data: existing } = await supabase
    .from("doctors")
    .select("senior_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("doctors")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit(supabase, user.id, existing.senior_id, "doctor.update", { id, fields: Object.keys(parsed.data) });
  return NextResponse.json({ doctor: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("doctors")
    .select("senior_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error } = await supabase.from("doctors").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit(supabase, user.id, existing.senior_id, "doctor.delete", { id });
  return NextResponse.json({ success: true });
}
