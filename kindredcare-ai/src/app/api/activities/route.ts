import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { z } from "zod";

const schema = z.object({
  careCenterId: z.string().uuid(),
  title: z.string().min(1).max(200),
  activity_type: z.string().min(1),
  description: z.string().optional(),
  scheduled_at: z.string(),
  duration_minutes: z.number().int().default(60),
  max_participants: z.number().int().nullable().optional(),
  location: z.string().optional(),
  transportation_provided: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const d = parsed.data;
  const { error, data } = await supabase.from("center_activities").insert({
    care_center_id: d.careCenterId,
    created_by: user.id,
    title: d.title,
    activity_type: d.activity_type,
    description: d.description ?? null,
    scheduled_at: d.scheduled_at,
    duration_minutes: d.duration_minutes,
    max_participants: d.max_participants ?? null,
    location: d.location ?? null,
    transportation_provided: d.transportation_provided,
    tags: d.tags ?? null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit(supabase, user.id, null, "center_activity.create", {
    id: data.id,
    title: d.title,
    care_center_id: d.careCenterId,
  });
  return NextResponse.json({ activity: data });
}
