import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { z } from "zod";

const createSchema = z.object({
  seniorId: z.string().uuid(),
  full_name: z.string().min(1).max(200),
  relationship: z.string().min(1).max(50),
  phone: z.string().min(3).max(40),
  is_primary: z.boolean().optional(),
  sort_order: z.number().int().min(0).max(100).optional(),
});

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const seniorId = searchParams.get("seniorId");
  if (!seniorId) return NextResponse.json({ error: "seniorId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("senior_id", seniorId)
    .order("is_primary", { ascending: false })
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contacts: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid", details: parsed.error.format() }, { status: 400 });

  const d = parsed.data;
  const { data, error } = await supabase
    .from("emergency_contacts")
    .insert({
      senior_id: d.seniorId,
      full_name: d.full_name,
      relationship: d.relationship,
      phone: d.phone,
      is_primary: d.is_primary ?? false,
      sort_order: d.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit(supabase, user.id, d.seniorId, "emergency_contact.create", { id: data.id });
  return NextResponse.json({ contact: data });
}
