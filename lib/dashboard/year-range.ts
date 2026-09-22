export function utcCalendarYearRange(asOf: Date): {
  year: number;
  start: Date;
  endExclusive: Date;
} {
  const year = asOf.getUTCFullYear();
  return {
    year,
    start: new Date(Date.UTC(year, 0, 1)),
    endExclusive: new Date(Date.UTC(year + 1, 0, 1)),
  };
}
