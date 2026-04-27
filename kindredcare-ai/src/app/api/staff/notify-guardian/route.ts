import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { z } from "zod";

const schema = z.object({
  seniorId: z.string().uuid(),
  reason: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { error } = await supabase.from("risk_alerts").insert({
    senior_id: parsed.data.seniorId,
    triggered_by: user.id,
    severity: "medium",
    category: "wellness",
    title: "Care center notified the guardian",
    description: parsed.data.reason,
    source: "manual",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit(supabase, user.id, parsed.data.seniorId, "staff.notify_guardian", { reason: parsed.data.reason });
  return NextResponse.json({ success: true });
}
