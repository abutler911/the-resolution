import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

// Aggregate stats for the signed-in user: per-type accuracy and a current
// "streak" of consecutive correct attempts (most recent first).
export async function getSummary(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;

  const grouped = await prisma.exerciseAttempt.groupBy({
    by: ["type", "isCorrect"],
    where: { userId },
    _count: { _all: true },
  });

  const byType: Record<string, { correct: number; total: number }> = {};
  for (const row of grouped) {
    const bucket = (byType[row.type] ??= { correct: 0, total: 0 });
    bucket.total += row._count._all;
    if (row.isCorrect) bucket.correct += row._count._all;
  }

  const recent = await prisma.exerciseAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { isCorrect: true },
  });

  let streak = 0;
  for (const attempt of recent) {
    if (!attempt.isCorrect) break;
    streak++;
  }

  const totals = Object.values(byType).reduce(
    (acc, b) => ({
      correct: acc.correct + b.correct,
      total: acc.total + b.total,
    }),
    { correct: 0, total: 0 },
  );

  const completedLessons = await prisma.lessonProgress.count({
    where: { userId, completed: true },
  });

  res.json({ byType, totals, streak, completedLessons });
}

// Lesson progress records for the signed-in user, so the client can show
// which lessons are completed and toggle their state.
export async function listLessonProgress(
  req: Request,
  res: Response,
): Promise<void> {
  const progress = await prisma.lessonProgress.findMany({
    where: { userId: req.userId! },
    select: { lessonId: true, completed: true, completedAt: true },
  });
  res.json({ progress });
}

const completeSchema = z.object({
  lessonId: z.string().min(1),
  completed: z.boolean().default(true),
});

export async function setLessonProgress(
  req: Request,
  res: Response,
): Promise<void> {
  const { lessonId, completed } = completeSchema.parse(req.body);
  const userId = req.userId!;

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: {
      userId,
      lessonId,
      completed,
      completedAt: completed ? new Date() : null,
    },
    update: { completed, completedAt: completed ? new Date() : null },
  });

  res.json({ progress });
}
