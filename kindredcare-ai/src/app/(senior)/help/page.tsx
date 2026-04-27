import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SeniorShell } from "@/components/layout/SeniorShell";
import { EmergencyPanel } from "@/components/senior/EmergencyPanel";
import { DISCLAIMER } from "@/lib/constants";

export default async function HelpPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: senior } = await supabase
    .from("seniors")
    .select("id, high_contrast")
    .eq("user_id", user.id)
    .single();

  if (!senior) redirect("/home");

  const [{ data: contacts }, { data: doctors }, { data: centerLink }] = await Promise.all([
    supabase
      .from("emergency_contacts")
      .select("*")
      .eq("senior_id", senior.id)
      .order("sort_order"),
    supabase
      .from("doctors")
      .select("*")
      .eq("senior_id", senior.id)
      .order("is_primary", { ascending: false }),
    supabase
      .from("senior_center_links")
      .select("care_centers(phone)")
      .eq("senior_id", senior.id)
      .eq("status", "active")
      .limit(1)
      .single(),
  ]);

  const centerCenters = (centerLink as { care_centers?: { phone?: string | null } | { phone?: string | null }[] } | null)?.care_centers;
  const centerPhone = Array.isArray(centerCenters)
    ? centerCenters[0]?.phone ?? null
    : centerCenters?.phone ?? null;

  return (
    <SeniorShell title="Help" showBack backHref="/home" highContrast={senior.high_contrast}>
      <EmergencyPanel
        contacts={contacts ?? []}
        doctors={doctors ?? []}
        careCenterPhone={centerPhone}
      />
    </SeniorShell>
  );
}
