export const REPORT_TIME_ZONE = "Asia/Manila" as const;
export const MANILA_OFFSET_HOURS = 8;

export type CalendarYmd = {
  year: number;
  month: number;
  day: number;
};

export type ManilaDateTimeRange = {
  timeZone: typeof REPORT_TIME_ZONE;
  startDate: string;
  endDate: string;
  startInclusive: Date;
  endExclusive: Date;
};

export type ManilaCalendarDateRange = {
  timeZone: typeof REPORT_TIME_ZONE;
  startDate: string;
  endDate: string;
  startInclusive: Date;
  endExclusive: Date;
};

const YMD_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseCalendarYmd(value: string): CalendarYmd | null {
  const match = YMD_PATTERN.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

export function isValidCalendarYmd(value: string): boolean {
  return parseCalendarYmd(value) !== null;
}

export function addCalendarDays(ymd: CalendarYmd, days: number): CalendarYmd {
  const utc = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day + days));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

export function formatCalendarYmd(ymd: CalendarYmd): string {
  const month = String(ymd.month).padStart(2, "0");
  const day = String(ymd.day).padStart(2, "0");
  return `${ymd.year}-${month}-${day}`;
}

function manilaDayStartUtc(ymd: CalendarYmd): Date {
  return new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day, -MANILA_OFFSET_HOURS, 0, 0, 0));
}

function utcDateOnly(ymd: CalendarYmd): Date {
  return new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day));
}

export function manilaDateTimeRange(startDate: string, endDate: string): ManilaDateTimeRange {
  const start = parseCalendarYmd(startDate);
  const end = parseCalendarYmd(endDate);
  if (!start || !end) {
    throw new Error("Invalid report calendar date");
  }
  if (startDate > endDate) {
    throw new Error("Report start date is after end date");
  }

  return {
    timeZone: REPORT_TIME_ZONE,
    startDate,
    endDate,
    startInclusive: manilaDayStartUtc(start),
    endExclusive: manilaDayStartUtc(addCalendarDays(end, 1)),
  };
}

export function manilaCalendarDateRange(
  startDate: string,
  endDate: string,
): ManilaCalendarDateRange {
  const start = parseCalendarYmd(startDate);
  const end = parseCalendarYmd(endDate);
  if (!start || !end) {
    throw new Error("Invalid report calendar date");
  }
  if (startDate > endDate) {
    throw new Error("Report start date is after end date");
  }

  return {
    timeZone: REPORT_TIME_ZONE,
    startDate,
    endDate,
    startInclusive: utcDateOnly(start),
    endExclusive: utcDateOnly(addCalendarDays(end, 1)),
  };
}

export function toManilaCalendarDate(value: Date): string {
  const shifted = new Date(value.getTime() + MANILA_OFFSET_HOURS * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
}

export function toUtcCalendarDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}
