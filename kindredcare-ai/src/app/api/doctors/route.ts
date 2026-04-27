import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { z } from "zod";

const createSchema = z.object({
  seniorId: z.string().uuid(),
  full_name: z.string().min(1).max(200),
  specialty: z.string().max(100).nullable().optional(),
  clinic_name: z.string().max(200).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  office_hours: z.string().max(200).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  is_primary: z.boolean().optional(),
});

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const seniorId = searchParams.get("seniorId");
  if (!seniorId) return NextResponse.json({ error: "seniorId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("senior_id", seniorId)
    .order("is_primary", { ascending: false })
    .order("full_name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ doctors: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid", details: parsed.error.format() }, { status: 400 });

  const d = parsed.data;
  const { data, error } = await supabase
    .from("doctors")
    .insert({
      senior_id: d.seniorId,
      full_name: d.full_name,
      specialty: d.specialty ?? null,
      clinic_name: d.clinic_name ?? null,
      phone: d.phone ?? null,
      office_hours: d.office_hours ?? null,
      notes: d.notes ?? null,
      is_primary: d.is_primary ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit(supabase, user.id, d.seniorId, "doctor.create", { id: data.id });
  return NextResponse.json({ doctor: data });
}
