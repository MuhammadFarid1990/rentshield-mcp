import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createSchema = z.object({
  seniorId: z.string().uuid(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  category: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  source: z.string().default("manual"),
});

const updateSchema = z.object({
  alertId: z.string().uuid(),
  status: z.enum(["acknowledged", "resolved"]),
  resolution_note: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { error } = await supabase.from("risk_alerts").insert({
    senior_id: parsed.data.seniorId,
    triggered_by: user.id,
    severity: parsed.data.severity,
    category: parsed.data.category,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    source: parsed.data.source,
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
  if (parsed.data.status === "acknowledged") {
    update.acknowledged_by = user.id;
    update.acknowledged_at = new Date().toISOString();
  } else if (parsed.data.status === "resolved") {
    update.resolved_by = user.id;
    update.resolved_at = new Date().toISOString();
    if (parsed.data.resolution_note) update.resolution_note = parsed.data.resolution_note;
  }

  const { error } = await supabase.from("risk_alerts").update(update).eq("id", parsed.data.alertId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
