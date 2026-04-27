import type { DailyCareStatus } from "@/types/domain";

export interface SuggestedAction {
  level: "info" | "warn" | "urgent";
  title: string;
  detail: string;
  actionLabel?: string;
  actionHref?: string;
}

export function suggestActionForGuardian(
  status: DailyCareStatus | null,
  seniorName: string,
  seniorId: string,
): SuggestedAction {
  const firstName = seniorName.split(" ")[0];

  if (!status) {
    return {
      level: "info",
      title: "No status yet today",
      detail: `We do not have a care status for ${firstName} yet. Check back later or open the alerts page if you are concerned.`,
      actionLabel: "View alerts",
      actionHref: "/guardian/alerts",
    };
  }

  if (status.overall_status === "red" || status.open_alerts_count > 0) {
    return {
      level: "urgent",
      title: "Urgent attention needed",
      detail:
        status.open_alerts_count > 0
          ? `${firstName} has ${status.open_alerts_count} open alert${status.open_alerts_count > 1 ? "s" : ""}. Please review them now.`
          : `${firstName}'s care status is red today. Please check in by call.`,
      actionLabel: "View alerts",
      actionHref: "/guardian/alerts",
    };
  }

  if (status.medicine_status !== "green" && status.missed_reminders_count > 0) {
    return {
      level: "warn",
      title: "Missed medicine reminders",
      detail: `${firstName} has ${status.missed_reminders_count} missed reminder${status.missed_reminders_count > 1 ? "s" : ""} today. A friendly call could help.`,
      actionLabel: "Open medication",
      actionHref: `/guardian/medication?seniorId=${seniorId}`,
    };
  }

  if (status.mood_status === "yellow") {
    return {
      level: "warn",
      title: "Mood may need a lift",
      detail: `${firstName}'s last check-in suggests they could use some company. A short call or family message would mean a lot.`,
      actionLabel: "Send a message",
      actionHref: "/guardian/messages",
    };
  }

  if (status.health_status === "yellow" || status.health_status === "red") {
    return {
      level: "warn",
      title: "Health readings worth a look",
      detail: `${firstName} has health readings outside the safe range. Please review their recent logs.`,
      actionLabel: "View health",
      actionHref: `/guardian/health?seniorId=${seniorId}`,
    };
  }

  if (!status.checkin_completed) {
    return {
      level: "info",
      title: "No check-in yet today",
      detail: `${firstName} has not completed a wellness check-in today. They may simply be busy — no need to worry.`,
    };
  }

  return {
    level: "info",
    title: "All looking well",
    detail: `${firstName} is doing well today. Reminders are on track and no alerts are open.`,
  };
}
