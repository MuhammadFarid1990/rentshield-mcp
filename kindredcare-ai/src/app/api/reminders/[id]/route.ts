import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { z } from "zod";

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  scheduled_at: z.string().optional(),
  duration_minutes: z.number().int().min(0).max(1440).optional(),
  location: z.string().max(200).nullable().optional(),
  voice_alert: z.boolean().optional(),
  voice_message: z.string().max(500).nullable().optional(),
  is_completed: z.boolean().optional(),
  is_cancelled: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid", details: parsed.error.format() }, { status: 400 });

  const { data: existing, error: fetchErr } = await supabase
    .from("calendar_events")
    .select("senior_id")
    .eq("id", id)
    .single();
  if (fetchErr || !existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.is_completed === true) {
    update.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit(supabase, user.id, existing.senior_id, "reminder.update", { id, fields: Object.keys(parsed.data) });
  return NextResponse.json({ event: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing, error: fetchErr } = await supabase
    .from("calendar_events")
    .select("senior_id")
    .eq("id", id)
    .single();
  if (fetchErr || !existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error } = await supabase
    .from("calendar_events")
    .update({ is_cancelled: true })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit(supabase, user.id, existing.senior_id, "reminder.cancel", { id });
  return NextResponse.json({ success: true });
}
