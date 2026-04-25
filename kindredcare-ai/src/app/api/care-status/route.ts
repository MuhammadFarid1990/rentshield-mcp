import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertDailyCareStatus } from "@/lib/care-status/compute";
import { z } from "zod";

const schema = z.object({ seniorId: z.string().uuid() });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await upsertDailyCareStatus(supabase, parsed.data.seniorId);
  return NextResponse.json({ success: true });
}
