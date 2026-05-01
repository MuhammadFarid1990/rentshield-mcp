import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  seniorId: z.string().uuid(),
  pickup_at: z.string(),
  pickup_address: z.string().optional(),
  dropoff_address: z.string().optional(),
  purpose: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { error } = await supabase.from("transportation_requests").insert({
    senior_id: parsed.data.seniorId,
    requested_by: user.id,
    pickup_at: parsed.data.pickup_at,
    pickup_address: parsed.data.pickup_address ?? null,
    dropoff_address: parsed.data.dropoff_address ?? null,
    purpose: parsed.data.purpose ?? null,
    status: "pending",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
