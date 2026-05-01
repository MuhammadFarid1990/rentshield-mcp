import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createSchema = z.object({
  seniorId: z.string().uuid(),
  careCenterId: z.string().uuid().optional(),
  requestedDate: z.string(),
  preferredTime: z.string().optional(),
  reason: z.string().optional(),
});

const updateSchema = z.object({
  visitId: z.string().uuid(),
  status: z.enum(["confirmed", "completed", "cancelled"]),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  let careCenterId = parsed.data.careCenterId;
  if (!careCenterId) {
    const { data: link } = await supabase
      .from("senior_center_links").select("care_center_id")
      .eq("senior_id", parsed.data.seniorId).eq("status", "active").limit(1).single();
    if (!link) return NextResponse.json({ error: "No active care center linked" }, { status: 400 });
    careCenterId = link.care_center_id;
  }

  const { error } = await supabase.from("visit_requests").insert({
    senior_id: parsed.data.seniorId,
    care_center_id: careCenterId,
    requested_by: user.id,
    requested_date: parsed.data.requestedDate,
    preferred_time: parsed.data.preferredTime ?? null,
    reason: parsed.data.reason ?? null,
    status: "pending",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const update: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "confirmed") {
    update.confirmed_by = user.id;
    update.confirmed_at = new Date().toISOString();
  }
  if (parsed.data.notes) update.notes = parsed.data.notes;

  const { error } = await supabase.from("visit_requests").update(update).eq("id", parsed.data.visitId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
