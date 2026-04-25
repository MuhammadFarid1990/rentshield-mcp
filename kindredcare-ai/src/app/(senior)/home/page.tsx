import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SeniorShell } from "@/components/layout/SeniorShell";
import { HomeTriad } from "@/components/senior/HomeTriad";

export default async function SeniorHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: senior } = await supabase
    .from("seniors")
    .select("*, user:users(full_name, email)")
    .eq("user_id", user.id)
    .single();

  const name = senior?.preferred_name ?? senior?.user?.full_name ?? "Friend";
  const highContrast = senior?.high_contrast ?? false;

  return (
    <SeniorShell highContrast={highContrast}>
      <HomeTriad seniorName={name} />
    </SeniorShell>
  );
}
