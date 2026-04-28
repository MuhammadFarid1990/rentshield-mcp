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

export function getTimeOfDayGreeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 5) return "Hello";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Hello";
}

export function describeUntil(dateStr: string, now: Date = new Date()): string {
  const target = parseISO(dateStr);
  const diffMin = Math.round((target.getTime() - now.getTime()) / 60000);
  if (diffMin <= 0) return "now";
  if (diffMin < 60) return `in ${diffMin} minute${diffMin === 1 ? "" : "s"}`;
  const hours = Math.round(diffMin / 60);
  if (hours < 24) return `in about ${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `in about ${days} day${days === 1 ? "" : "s"}`;
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
