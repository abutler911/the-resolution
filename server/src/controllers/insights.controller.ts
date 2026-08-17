import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  addDays,
  dayKey,
  daysBetween,
  resolveToday,
  startOfWeek,
} from "../lib/practiceDates.js";
import {
  currentStreak,
  longestStreak,
  sumWindow,
  tallyDay,
  toDenseSeries,
  type DayTotals,
} from "../lib/practiceStats.js";

const querySchema = z.object({
  // 365 keeps a full-year heatmap on the table without unbounded scans.
  days: z.coerce.number().int().min(7).max(365).default(90),
});

const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * Everything the insights screen plots, in one request. The queries are split
 * by what they need: a light all-time pass for streak arithmetic, and a
 * detailed pass over the selected range for the breakdowns.
 */
export async function getInsights(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { days } = querySchema.parse(req.query);
  const today = resolveToday(req.query.today);
  const rangeStart = addDays(today, -(days - 1));

  const [allSessions, rangeSessions] = await Promise.all([
    prisma.practiceSession.findMany({
      where: { userId },
      select: { date: true, totalMinutes: true },
      orderBy: { date: "asc" },
    }),
    prisma.practiceSession.findMany({
      where: { userId, date: { gte: rangeStart, lte: today } },
      select: {
        date: true,
        totalMinutes: true,
        mood: true,
        focus: true,
        segments: {
          select: {
            focusArea: true,
            minutes: true,
            tempo: true,
            quality: true,
            metronome: true,
            pieceId: true,
            piece: { select: { id: true, title: true, composer: true } },
          },
        },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  // --- Streaks and all-time totals -----------------------------------------
  const allTimeTotals: DayTotals = new Map();
  let allTimeMinutes = 0;
  for (const session of allSessions) {
    tallyDay(allTimeTotals, session.date, session.totalMinutes);
    allTimeMinutes += session.totalMinutes;
  }

  // --- Range series ---------------------------------------------------------
  const rangeTotals: DayTotals = new Map();
  for (const session of rangeSessions) {
    tallyDay(rangeTotals, session.date, session.totalMinutes);
  }
  const daily = toDenseSeries(rangeTotals, rangeStart, today);

  // --- Focus-area and per-piece breakdowns ----------------------------------
  const focusTotals = new Map<string, { minutes: number; segments: number }>();
  const pieceTotals = new Map<
    string,
    {
      title: string;
      composer: string | null;
      minutes: number;
      bestTempo: number | null;
      lastPracticed: string;
    }
  >();
  const weekTotals = new Map<
    string,
    { minutes: number; qualitySum: number; qualityCount: number }
  >();

  let metronomeMinutes = 0;
  let qualitySum = 0;
  let qualityCount = 0;

  for (const session of rangeSessions) {
    const weekKey = dayKey(startOfWeek(session.date));
    const week = weekTotals.get(weekKey) ?? { minutes: 0, qualitySum: 0, qualityCount: 0 };
    week.minutes += session.totalMinutes;

    for (const segment of session.segments) {
      const focus = focusTotals.get(segment.focusArea) ?? { minutes: 0, segments: 0 };
      focus.minutes += segment.minutes;
      focus.segments += 1;
      focusTotals.set(segment.focusArea, focus);

      if (segment.metronome) metronomeMinutes += segment.minutes;

      if (segment.quality != null) {
        qualitySum += segment.quality;
        qualityCount += 1;
        week.qualitySum += segment.quality;
        week.qualityCount += 1;
      }

      if (segment.piece) {
        const entry = pieceTotals.get(segment.piece.id) ?? {
          title: segment.piece.title,
          composer: segment.piece.composer,
          minutes: 0,
          bestTempo: null as number | null,
          lastPracticed: dayKey(session.date),
        };
        entry.minutes += segment.minutes;
        entry.lastPracticed = dayKey(session.date);
        if (segment.tempo != null && (entry.bestTempo == null || segment.tempo > entry.bestTempo)) {
          entry.bestTempo = segment.tempo;
        }
        pieceTotals.set(segment.piece.id, entry);
      }
    }

    weekTotals.set(weekKey, week);
  }

  const rangeMinutes = daily.reduce((sum, day) => sum + day.minutes, 0);
  const rangeSessionCount = rangeSessions.length;
  const rangeDaysPractised = daily.filter((day) => day.minutes > 0).length;

  // --- Week-over-week comparison -------------------------------------------
  // Compared like for like: a Monday's two hours shouldn't read as "down 300
  // minutes" against a finished week, so last week is measured over the same
  // number of days elapsed rather than all seven.
  const thisWeekStart = startOfWeek(today);
  const lastWeekStart = addDays(thisWeekStart, -7);
  const daysElapsed = daysBetween(thisWeekStart, today) + 1;
  const thisWeek = sumWindow(allTimeTotals, thisWeekStart, addDays(thisWeekStart, 7));
  const lastWeek = sumWindow(allTimeTotals, lastWeekStart, addDays(lastWeekStart, daysElapsed));
  const lastWeekFull = sumWindow(allTimeTotals, lastWeekStart, thisWeekStart);

  res.json({
    range: { from: dayKey(rangeStart), to: dayKey(today), days },
    totals: {
      minutes: rangeMinutes,
      sessions: rangeSessionCount,
      daysPractised: rangeDaysPractised,
      averageSessionMinutes: rangeSessionCount ? Math.round(rangeMinutes / rangeSessionCount) : 0,
      averageDailyMinutes: round1(rangeMinutes / days),
      averageQuality: qualityCount ? round1(qualitySum / qualityCount) : null,
      metronomeShare: rangeMinutes ? Math.round((metronomeMinutes / rangeMinutes) * 100) : 0,
    },
    allTime: {
      minutes: allTimeMinutes,
      sessions: allSessions.length,
      daysPractised: allTimeTotals.size,
      firstSession: allSessions.length ? dayKey(allSessions[0]!.date) : null,
    },
    streak: {
      current: currentStreak(allTimeTotals, today),
      longest: longestStreak(allTimeTotals),
    },
    thisWeek: { minutes: thisWeek.minutes, sessions: thisWeek.sessions, daysElapsed },
    // `lastWeek` is the like-for-like slice; `lastWeekTotal` is that week finished.
    lastWeek: { minutes: lastWeek.minutes, sessions: lastWeek.sessions },
    lastWeekTotal: { minutes: lastWeekFull.minutes, sessions: lastWeekFull.sessions },
    daily,
    byFocus: [...focusTotals.entries()]
      .map(([focusArea, entry]) => ({ focusArea, ...entry }))
      .sort((a, b) => b.minutes - a.minutes),
    byPiece: [...pieceTotals.entries()]
      .map(([id, entry]) => ({ pieceId: id, ...entry }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 10),
    weekly: [...weekTotals.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekStart, entry]) => ({
        weekStart,
        minutes: entry.minutes,
        averageQuality: entry.qualityCount ? round1(entry.qualitySum / entry.qualityCount) : null,
      })),
  });
}
