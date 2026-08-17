/**
 * Aggregation helpers shared by the goals and insights endpoints.
 *
 * These all work on plain day-keyed maps rather than talking to the database,
 * so the same arithmetic backs a goal ring, a heatmap cell, and a streak count.
 */

import { addDays, dayKey, daysBetween } from "./practiceDates.js";

export interface DayTotal {
  minutes: number;
  sessions: number;
}

export type DayTotals = Map<string, DayTotal>;

/** Add a session's contribution to a day-keyed tally. */
export function tallyDay(totals: DayTotals, date: Date, minutes: number): void {
  const key = dayKey(date);
  const entry = totals.get(key) ?? { minutes: 0, sessions: 0 };
  entry.minutes += minutes;
  entry.sessions += 1;
  totals.set(key, entry);
}

/**
 * Consecutive practised days ending today. A day that hasn't happened yet
 * shouldn't break a streak, so a streak that stops at yesterday still counts —
 * it is only broken once a full day has been missed.
 */
export function currentStreak(totals: DayTotals, today: Date): number {
  let cursor = today;
  if (!totals.has(dayKey(cursor))) {
    cursor = addDays(cursor, -1);
    if (!totals.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (totals.has(dayKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** The longest run of consecutive practised days anywhere in the log. */
export function longestStreak(totals: DayTotals): number {
  const days = [...totals.keys()].sort();
  let best = 0;
  let run = 0;
  let previous: Date | null = null;

  for (const key of days) {
    const date = new Date(`${key}T00:00:00.000Z`);
    run = previous && daysBetween(previous, date) === 1 ? run + 1 : 1;
    if (run > best) best = run;
    previous = date;
  }
  return best;
}

/** Sum minutes / sessions / distinct days across a half-open [start, end) window. */
export function sumWindow(
  totals: DayTotals,
  start: Date,
  end: Date,
): { minutes: number; sessions: number; days: number } {
  let minutes = 0;
  let sessions = 0;
  let days = 0;

  for (let cursor = start; cursor < end; cursor = addDays(cursor, 1)) {
    const entry = totals.get(dayKey(cursor));
    if (!entry) continue;
    minutes += entry.minutes;
    sessions += entry.sessions;
    days += 1;
  }
  return { minutes, sessions, days };
}

/**
 * Fill every day in [start, end] so charts get a continuous series — a gap in
 * the data is a zero-minute day, not a missing point.
 */
export function toDenseSeries(
  totals: DayTotals,
  start: Date,
  end: Date,
): Array<{ date: string; minutes: number; sessions: number }> {
  const series: Array<{ date: string; minutes: number; sessions: number }> = [];
  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    const key = dayKey(cursor);
    const entry = totals.get(key);
    series.push({
      date: key,
      minutes: entry?.minutes ?? 0,
      sessions: entry?.sessions ?? 0,
    });
  }
  return series;
}
