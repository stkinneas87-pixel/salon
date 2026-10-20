import { clsx, type ClassValue } from "clsx";

import { dayKeys, type DayKey } from "@/lib/content/constants";
import type { DayHours, SiteSettings } from "@/lib/content/schemas";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatPrice(cents: number, type: "fixed" | "from") {
  return `${type === "from" ? "from " : ""}${formatMoney(cents)}`;
}

export function getEffectivePriceCents(
  priceCents: number,
  salePriceCents: number | null | undefined,
) {
  return salePriceCents !== null &&
    salePriceCents !== undefined &&
    salePriceCents < priceCents
    ? salePriceCents
    : priceCents;
}

export function hasSalePrice(
  priceCents: number,
  salePriceCents: number | null | undefined,
) {
  return (
    salePriceCents !== null &&
    salePriceCents !== undefined &&
    salePriceCents < priceCents
  );
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} hr`;
  return `${hours} hr ${rest} min`;
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(total: number) {
  const hours = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "pm" : "am";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatHourRange(open: string, close: string) {
  const format = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const suffix = hours >= 12 ? "pm" : "am";
    const display = hours % 12 || 12;
    return minutes === 0 ? `${display}${suffix}` : `${display}:${String(minutes).padStart(2, "0")}${suffix}`;
  };
  return `${format(open)}–${format(close)}`;
}

export function dateToUtc(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

export function weekdayIndex(date: string) {
  return dateToUtc(date).getUTCDay();
}

export function addDays(date: string, days: number) {
  const value = dateToUtc(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string) {
  return Math.round(
    (dateToUtc(to).getTime() - dateToUtc(from).getTime()) / 86_400_000,
  );
}

export function formatDateLong(date: string) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dateToUtc(date));
}

export function formatDateShort(date: string) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(dateToUtc(date));
}

const dayFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  timeZone: "UTC",
});

const dayMonthFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const dayMonthYearFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const monthYearFormatter = new Intl.DateTimeFormat("en-AU", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDateRange(startDate: string, endDate: string | null) {
  const start = dateToUtc(startDate);
  if (!endDate) return `From ${dayMonthYearFormatter.format(start)}`;

  const end = dateToUtc(endDate);
  if (startDate === endDate) return dayMonthYearFormatter.format(start);

  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();

  if (sameMonth) {
    return `${dayFormatter.format(start)}–${dayFormatter.format(end)} ${monthYearFormatter.format(end)}`;
  }
  if (sameYear) {
    return `${dayMonthFormatter.format(start)} – ${dayMonthFormatter.format(end)} ${end.getUTCFullYear()}`;
  }
  return `${dayMonthYearFormatter.format(start)} – ${dayMonthYearFormatter.format(end)}`;
}

export function getSydneyToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function getSydneyNowMinutes(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Australia/Sydney",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "0";
  const hour = Number(get("hour")) % 24;
  return hour * 60 + Number(get("minute"));
}

export function isDayClosed(hours: DayHours) {
  return hours.closed || timeToMinutes(hours.close) <= timeToMinutes(hours.open);
}

type HoursRecord = SiteSettings["hours"];

export function getDayHours(hours: HoursRecord, date: string): DayHours {
  const key = dayKeys[weekdayIndex(date)] as DayKey;
  return hours[key];
}

export function groupOpenHours(hours: HoursRecord) {
  const groups: Array<{ days: DayKey[]; open: string; close: string }> = [];
  for (const day of dayKeys) {
    const value = hours[day];
    if (isDayClosed(value)) continue;
    const last = groups[groups.length - 1];
    if (last && last.open === value.open && last.close === value.close) {
      last.days.push(day);
    } else {
      groups.push({ days: [day], open: value.open, close: value.close });
    }
  }
  return groups;
}

export function formatClosedDays(hours: HoursRecord) {
  const names: Record<DayKey, string> = {
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
  };
  const closed = dayKeys.filter((day) => isDayClosed(hours[day]));
  if (closed.length === 0) return "";
  if (closed.length === 7) return "Closed all week";
  const labels = closed.map((day) => names[day]);
  if (labels.length === 1) return `Closed ${labels[0]}`;
  return `Closed ${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

export function formatHoursSummary(hours: HoursRecord) {
  const groups = groupOpenHours(hours);
  if (groups.length === 0) return "Opening hours coming soon";

  const names: Record<DayKey, string> = {
    sunday: "Sun",
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
  };

  return groups
    .map((group) => {
      const first = group.days[0];
      const last = group.days[group.days.length - 1];
      const label =
        group.days.length === 1
          ? names[first]
          : group.days.length === 2
            ? `${names[first]} & ${names[last]}`
            : `${names[first]}–${names[last]}`;
      return `${label} ${formatHourRange(group.open, group.close)}`;
    })
    .join(" · ");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function absoluteUrl(path: string, siteUrl: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
