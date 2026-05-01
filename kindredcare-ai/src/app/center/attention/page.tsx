import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CenterShell } from "@/components/layout/CenterShell";
import { AttentionQueue } from "@/components/center/AttentionQueue";
import type { DailyCareStatus, Senior, User } from "@/types/domain";

export default async function AttentionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staffRecord } = await supabase
    .from("staff")
    .select("care_center_id")
    .eq("user_id", user.id)
    .single();

  if (!staffRecord) redirect("/login");

  const { data: links } = await supabase
    .from("senior_center_links")
    .select("senior:seniors(*, user:users(full_name, phone))")
    .eq("care_center_id", staffRecord.care_center_id)
    .eq("status", "active");

  const seniors = (links ?? []).map((l) => l.senior as unknown as Senior & { user: User });

  const today = new Date().toISOString().slice(0, 10);
  const seniorIds = seniors.map((s) => s.id);
  const [{ data: statuses }, { data: openAlerts }] = seniorIds.length
    ? await Promise.all([
        supabase
          .from("daily_care_status")
          .select("*")
          .in("senior_id", seniorIds)
          .eq("status_date", today)
          .neq("overall_status", "green"),
        supabase
          .from("risk_alerts")
          .select("id, senior_id, created_at")
          .in("senior_id", seniorIds)
          .in("status", ["open", "acknowledged"])
          .order("created_at", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }];

  const statusMap = Object.fromEntries((statuses ?? []).map((s: DailyCareStatus) => [s.senior_id, s]));
  const alertMap: Record<string, string> = {};
  for (const a of (openAlerts ?? []) as { id: string; senior_id: string }[]) {
    if (!alertMap[a.senior_id]) alertMap[a.senior_id] = a.id;
  }
  const needsAttention = seniors.filter((s) => statusMap[s.id]);

  const rows = needsAttention.map((senior) => ({
    senior,
    status: statusMap[senior.id],
    openAlertId: alertMap[senior.id] ?? null,
  }));

  return (
    <CenterShell title="Who Needs Attention Today?">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Who Needs Attention Today?</h2>
          {needsAttention.length === 0 ? (
            <p className="text-green-700 font-semibold text-lg mt-2">All seniors are doing well today! 🎉</p>
          ) : (
            <p className="text-gray-500 mt-1">
              {rows.filter((r) => r.status.overall_status === "red").length} urgent, {" "}
              {rows.filter((r) => r.status.overall_status === "yellow").length} need follow-up
            </p>
          )}
        </div>
        <AttentionQueue rows={rows} />
      </div>
    </CenterShell>
  );
}
