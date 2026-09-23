import {
  MANILA_OFFSET_HOURS,
  parseCalendarYmd,
  REPORT_TIME_ZONE,
} from "@/lib/reports/manila-date-range";

export const CALENDAR_TIME_ZONE = REPORT_TIME_ZONE;

const LOCAL_DATE_TIME = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

export function manilaDateTimeToUtc(local: string): Date | null {
  const match = LOCAL_DATE_TIME.exec(local);
  if (!match) {
    return null;
  }

  const ymd = parseCalendarYmd(match[1]);
  if (!ymd) {
    return null;
  }

  const hour = Number(match[2]);
  const minute = Number(match[3]);
  const second = match[4] ? Number(match[4]) : 0;
  if (hour > 23 || minute > 59 || second > 59) {
    return null;
  }

  return new Date(
    Date.UTC(ymd.year, ymd.month - 1, ymd.day, hour - MANILA_OFFSET_HOURS, minute, second),
  );
}

export function utcToManilaDateTimeLocal(value: Date): string {
  const shifted = new Date(value.getTime() + MANILA_OFFSET_HOURS * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 16);
}

export function parseManilaDateTimeInput(value: string): Date | null {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return manilaDateTimeToUtc(`${trimmed}T00:00`);
  }
  if (/Z$|[+-]\d{2}:\d{2}$/.test(trimmed)) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return manilaDateTimeToUtc(trimmed);
}
