import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";
import {
  addDays,
  addMonths,
  dayKey,
  daysBetween,
  parseDay,
  resolveToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "../lib/practiceDates.js";

const goalMetric = z.enum(["MINUTES", "SESSIONS", "DAYS", "TEMPO"]);
const goalPeriod = z.enum(["DAILY", "WEEKLY", "MONTHLY", "TOTAL"]);
const focusArea = z.enum([
  "WARMUP",
  "TECHNIQUE",
  "SCALES",
  "REPERTOIRE",
  "SIGHT_READING",
  "EAR_TRAINING",
  "THEORY",
  "IMPROVISATION",
  "OTHER",
]);

const dayString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a YYYY-MM-DD date");

const goalSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    metric: goalMetric.default("MINUTES"),
    period: goalPeriod.default("WEEKLY"),
    target: z.number().int().min(1).max(100000),
    focusArea: focusArea.nullish(),
    pieceId: z.string().min(1).nullish(),
    startDate: dayString.optional(),
    endDate: dayString.nullish(),
  })
  .refine((goal) => goal.metric !== "TEMPO" || !!goal.pieceId, {
    message: "A tempo goal needs a piece to measure",
    path: ["pieceId"],
  })
  .refine((goal) => goal.metric !== "TEMPO" || goal.period === "TOTAL", {
    message: "Tempo goals are measured cumulatively, not per period",
    path: ["period"],
  });

const goalPatchSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  target: z.number().int().min(1).max(100000).optional(),
  endDate: dayString.nullish(),
  archived: z.boolean().optional(),
});

type GoalRecord = Awaited<ReturnType<typeof prisma.practiceGoal.findMany>>[number];

/**
 * The stretch of time a goal is currently judged over. Recurring goals reset
 * with the calendar (this day / this Monday-week / this month); a TOTAL goal
 * runs from the day it was set until its deadline, or forever.
 */
function windowFor(goal: GoalRecord, today: Date): { start: Date; end: Date } {
  const goalStart = startOfDay(goal.startDate);
  const tomorrow = addDays(today, 1);

  switch (goal.period) {
    case "DAILY":
      return { start: today, end: tomorrow };
    case "WEEKLY": {
      const start = startOfWeek(today);
      return { start, end: addDays(start, 7) };
    }
    case "MONTHLY": {
      const start = startOfMonth(today);
      return { start, end: addMonths(start, 1) };
    }
    case "TOTAL":
    default: {
      const end = goal.endDate ? addDays(startOfDay(goal.endDate), 1) : tomorrow;
      return { start: goalStart, end: end > tomorrow ? tomorrow : end };
    }
  }
}

interface SessionSlice {
  date: Date;
  totalMinutes: number;
  segments: Array<{
    pieceId: string | null;
    focusArea: string;
    minutes: number;
    tempo: number | null;
  }>;
}

/**
 * How far along a goal is right now. Narrowed goals (a focus area or a piece)
 * are measured from segments, so "5 hours of sight-reading this month" counts
 * only the sight-reading, not the sessions that happened to include some.
 */
function progressFor(
  goal: GoalRecord,
  sessions: SessionSlice[],
  window: { start: Date; end: Date },
): number {
  const inWindow = sessions.filter((s) => s.date >= window.start && s.date < window.end);

  if (goal.metric === "TEMPO") {
    let best = 0;
    for (const session of inWindow) {
      for (const segment of session.segments) {
        if (segment.pieceId === goal.pieceId && segment.tempo != null) {
          best = Math.max(best, segment.tempo);
        }
      }
    }
    return best;
  }

  const narrowed = goal.focusArea != null || goal.pieceId != null;

  if (!narrowed) {
    if (goal.metric === "SESSIONS") return inWindow.length;
    if (goal.metric === "DAYS") return new Set(inWindow.map((s) => dayKey(s.date))).size;
    return inWindow.reduce((sum, s) => sum + s.totalMinutes, 0);
  }

  let minutes = 0;
  let matchingSessions = 0;
  const days = new Set<string>();

  for (const session of inWindow) {
    const matches = session.segments.filter(
      (segment) =>
        (goal.focusArea == null || segment.focusArea === goal.focusArea) &&
        (goal.pieceId == null || segment.pieceId === goal.pieceId),
    );
    if (matches.length === 0) continue;

    matchingSessions += 1;
    days.add(dayKey(session.date));
    minutes += matches.reduce((sum, segment) => sum + segment.minutes, 0);
  }

  if (goal.metric === "SESSIONS") return matchingSessions;
  if (goal.metric === "DAYS") return days.size;
  return minutes;
}

function serialize(
  goal: GoalRecord,
  current: number,
  window: { start: Date; end: Date },
  pieceTitle: string | null,
  today: Date,
) {
  const windowEnd = addDays(window.end, -1);
  return {
    id: goal.id,
    title: goal.title,
    metric: goal.metric,
    period: goal.period,
    target: goal.target,
    focusArea: goal.focusArea,
    pieceId: goal.pieceId,
    pieceTitle,
    startDate: dayKey(goal.startDate),
    endDate: goal.endDate ? dayKey(goal.endDate) : null,
    archived: goal.archivedAt != null,
    current,
    // Clamped so a 250%-of-target week doesn't blow out a progress ring.
    percent: Math.min(100, Math.round((current / goal.target) * 100)),
    met: current >= goal.target,
    windowStart: dayKey(window.start),
    windowEnd: dayKey(windowEnd),
    // Days left in the current window, counting today.
    daysRemaining: Math.max(0, daysBetween(today, windowEnd) + 1),
  };
}

async function buildGoalPayload(userId: string, today: Date, includeArchived: boolean) {
  const goals = await prisma.practiceGoal.findMany({
    where: { userId, ...(includeArchived ? {} : { archivedAt: null }) },
    orderBy: [{ archivedAt: "asc" }, { createdAt: "asc" }],
  });

  if (goals.length === 0) return [];

  const windows = new Map(goals.map((goal) => [goal.id, windowFor(goal, today)]));
  const earliest = [...windows.values()].reduce(
    (min, w) => (w.start < min ? w.start : min),
    today,
  );

  const sessions = await prisma.practiceSession.findMany({
    where: { userId, date: { gte: earliest } },
    select: {
      date: true,
      totalMinutes: true,
      segments: {
        select: { pieceId: true, focusArea: true, minutes: true, tempo: true },
      },
    },
  });

  const pieceIds = [...new Set(goals.map((g) => g.pieceId).filter((id): id is string => !!id))];
  const pieces = pieceIds.length
    ? await prisma.piece.findMany({
        where: { id: { in: pieceIds }, userId },
        select: { id: true, title: true },
      })
    : [];
  const titles = new Map(pieces.map((piece) => [piece.id, piece.title]));

  return goals.map((goal) => {
    const window = windows.get(goal.id)!;
    return serialize(
      goal,
      progressFor(goal, sessions, window),
      window,
      goal.pieceId ? (titles.get(goal.pieceId) ?? null) : null,
      today,
    );
  });
}

export async function listGoals(req: Request, res: Response): Promise<void> {
  const today = resolveToday(req.query.today);
  const goals = await buildGoalPayload(
    req.userId!,
    today,
    req.query.includeArchived === "true",
  );
  res.json({ goals });
}

export async function createGoal(req: Request, res: Response): Promise<void> {
  const body = goalSchema.parse(req.body);
  const userId = req.userId!;

  if (body.pieceId) {
    const owned = await prisma.piece.count({ where: { id: body.pieceId, userId } });
    if (owned === 0) throw new HttpError(404, "Piece not found");
  }

  await prisma.practiceGoal.create({
    data: {
      userId,
      title: body.title,
      metric: body.metric,
      period: body.period,
      target: body.target,
      focusArea: body.focusArea ?? null,
      pieceId: body.pieceId ?? null,
      startDate: body.startDate ? parseDay(body.startDate) : resolveToday(req.body?.today),
      endDate: body.endDate ? parseDay(body.endDate) : null,
    },
  });

  const goals = await buildGoalPayload(userId, resolveToday(req.body?.today), false);
  res.status(201).json({ goals });
}

export async function updateGoal(req: Request, res: Response): Promise<void> {
  const body = goalPatchSchema.parse(req.body);
  const userId = req.userId!;

  const existing = await prisma.practiceGoal.findFirst({
    where: { id: req.params.id, userId },
    select: { id: true },
  });
  if (!existing) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  const { archived, endDate, ...fields } = body;
  await prisma.practiceGoal.update({
    where: { id: existing.id },
    data: {
      ...fields,
      ...(endDate === undefined ? {} : { endDate: endDate ? parseDay(endDate) : null }),
      ...(archived === undefined ? {} : { archivedAt: archived ? new Date() : null }),
    },
  });

  const goals = await buildGoalPayload(userId, resolveToday(req.body?.today), false);
  res.json({ goals });
}

export async function deleteGoal(req: Request, res: Response): Promise<void> {
  const { count } = await prisma.practiceGoal.deleteMany({
    where: { id: req.params.id, userId: req.userId! },
  });

  if (count === 0) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }
  res.status(204).end();
}
