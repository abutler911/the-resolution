/**
 * Day-bucketing helpers for practice tracking.
 *
 * Practice is counted in calendar days, but "which day is it?" depends on where
 * the player is sitting. The rule here: a practice day is stored as UTC
 * midnight of the *local* date the client reported, and every aggregate
 * (streaks, heatmaps, goal windows) buckets on those same UTC-midnight values.
 * That keeps arithmetic trivial and stable — the stored value never shifts a day
 * because of a timezone, because it is a date, not an instant.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parse a `YYYY-MM-DD` day key into UTC midnight. Throws on a bad shape. */
export function parseDay(key: string): Date {
  if (!DAY_PATTERN.test(key)) {
    throw new Error(`Expected a YYYY-MM-DD date, got "${key}"`);
  }
  const date = new Date(`${key}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Not a real calendar date: "${key}"`);
  }
  return date;
}

/** Format a Date as the `YYYY-MM-DD` key used everywhere on the wire. */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Snap an instant down to UTC midnight of its own day. */
export function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Whole days from `a` to `b`, both assumed to be UTC midnights. */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

/** Monday-start week, the convention most practice schedules assume. */
export function startOfWeek(date: Date): Date {
  const day = startOfDay(date);
  // getUTCDay() is 0=Sunday; shift so Monday is 0.
  const offset = (day.getUTCDay() + 6) % 7;
  return addDays(day, -offset);
}

export function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function addMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

/**
 * The client's local "today" as a UTC-midnight day, falling back to the
 * server's own date when the caller didn't say. Anything unparseable falls back
 * rather than erroring — a bad clock shouldn't 400 a dashboard.
 */
export function resolveToday(raw: unknown): Date {
  if (typeof raw === "string" && DAY_PATTERN.test(raw)) {
    try {
      return parseDay(raw);
    } catch {
      /* fall through to server date */
    }
  }
  return startOfDay(new Date());
}
