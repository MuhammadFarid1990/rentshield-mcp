import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertDailyCareStatus } from "@/lib/care-status/compute";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: staff } = await supabase
    .from("staff")
    .select("care_center_id")
    .eq("user_id", user.id)
    .single();

  if (!staff) return NextResponse.json({ error: "Not a staff member" }, { status: 403 });

  const { data: links } = await supabase
    .from("senior_center_links")
    .select("senior_id")
    .eq("care_center_id", staff.care_center_id)
    .eq("status", "active");

  const seniorIds = (links ?? []).map((l) => l.senior_id);
  if (seniorIds.length === 0) return NextResponse.json({ recomputed: 0 });

  await Promise.all(seniorIds.map((id) => upsertDailyCareStatus(supabase, id)));

  return NextResponse.json({ recomputed: seniorIds.length });
}
