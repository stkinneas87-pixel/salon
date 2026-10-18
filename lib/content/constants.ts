export const dayKeys = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type DayKey = (typeof dayKeys)[number];

export const pageSlugs = [
  "home",
  "about",
  "services",
  "contact",
  "privacy",
  "terms",
] as const;

export type PageSlug = (typeof pageSlugs)[number];

export const dayLabel: Record<DayKey, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};
