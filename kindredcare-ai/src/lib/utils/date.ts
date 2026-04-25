import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export function formatTime(dateStr: string, tz = "America/New_York") {
  return formatInTimeZone(parseISO(dateStr), tz, "h:mm a");
}

export function formatDate(dateStr: string, tz = "America/New_York") {
  return formatInTimeZone(parseISO(dateStr), tz, "MMMM d, yyyy");
}

export function formatDateShort(dateStr: string, tz = "America/New_York") {
  return formatInTimeZone(parseISO(dateStr), tz, "MMM d");
}

export function formatDatetime(dateStr: string, tz = "America/New_York") {
  return formatInTimeZone(parseISO(dateStr), tz, "MMMM d 'at' h:mm a");
}

export function relativeDay(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMMM d");
}

export function timeAgo(dateStr: string) {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}

export function getWeekBounds(date: Date) {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}
