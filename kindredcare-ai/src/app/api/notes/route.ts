import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { z } from "zod";

const createSchema = z.object({
  seniorId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  isPrivate: z.boolean().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { error } = await supabase.from("notes").insert({
    senior_id: parsed.data.seniorId,
    author_id: user.id,
    content: parsed.data.content,
    is_private: parsed.data.isPrivate ?? false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit(supabase, user.id, parsed.data.seniorId, "note.create");
  return NextResponse.json({ success: true });
}
