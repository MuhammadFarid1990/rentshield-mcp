import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { z } from "zod";

const patchSchema = z.object({
  full_name: z.string().min(1).max(200).optional(),
  relationship: z.string().min(1).max(50).optional(),
  phone: z.string().min(3).max(40).optional(),
  is_primary: z.boolean().optional(),
  sort_order: z.number().int().min(0).max(100).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid", details: parsed.error.format() }, { status: 400 });

  const { data: existing, error: fetchErr } = await supabase
    .from("emergency_contacts")
    .select("senior_id")
    .eq("id", id)
    .single();
  if (fetchErr || !existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("emergency_contacts")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit(supabase, user.id, existing.senior_id, "emergency_contact.update", { id, fields: Object.keys(parsed.data) });
  return NextResponse.json({ contact: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing, error: fetchErr } = await supabase
    .from("emergency_contacts")
    .select("senior_id")
    .eq("id", id)
    .single();
  if (fetchErr || !existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit(supabase, user.id, existing.senior_id, "emergency_contact.delete", { id });
  return NextResponse.json({ success: true });
}
