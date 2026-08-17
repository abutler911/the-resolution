import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";
import { dayKey, parseDay, resolveToday } from "../lib/practiceDates.js";

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

const hands = z.enum(["LEFT", "RIGHT", "BOTH"]);

// Blank strings from the form become null so we never store empty-string notes.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value))
    .nullish();

const segmentSchema = z
  .object({
    focusArea: focusArea.default("REPERTOIRE"),
    pieceId: z.string().min(1).nullish(),
    label: optionalText(200),
    minutes: z.number().int().min(1).max(720),
    tempo: z.number().int().min(20).max(320).nullish(),
    measureFrom: z.number().int().min(1).max(9999).nullish(),
    measureTo: z.number().int().min(1).max(9999).nullish(),
    hands: hands.nullish(),
    metronome: z.boolean().default(false),
    quality: z.number().int().min(1).max(5).nullish(),
    notes: optionalText(2000),
  })
  .refine(
    (s) => s.measureFrom == null || s.measureTo == null || s.measureTo >= s.measureFrom,
    { message: "measureTo must not be before measureFrom", path: ["measureTo"] },
  );

const sessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a YYYY-MM-DD date"),
  mood: z.number().int().min(1).max(5).nullish(),
  focus: z.number().int().min(1).max(5).nullish(),
  notes: optionalText(4000),
  segments: z.array(segmentSchema).max(40).default([]),
});

const listQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  pieceId: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(30),
});

const sessionWithSegments = {
  segments: {
    orderBy: { position: "asc" },
    include: { piece: { select: { id: true, title: true, composer: true } } },
  },
} satisfies Prisma.PracticeSessionInclude;

type SessionRecord = Prisma.PracticeSessionGetPayload<{
  include: typeof sessionWithSegments;
}>;

function serialize(session: SessionRecord) {
  return {
    id: session.id,
    date: dayKey(session.date),
    totalMinutes: session.totalMinutes,
    mood: session.mood,
    focus: session.focus,
    notes: session.notes,
    createdAt: session.createdAt.toISOString(),
    segments: session.segments.map((segment) => ({
      id: segment.id,
      focusArea: segment.focusArea,
      pieceId: segment.pieceId,
      pieceTitle: segment.piece?.title ?? null,
      pieceComposer: segment.piece?.composer ?? null,
      label: segment.label,
      minutes: segment.minutes,
      tempo: segment.tempo,
      measureFrom: segment.measureFrom,
      measureTo: segment.measureTo,
      hands: segment.hands,
      metronome: segment.metronome,
      quality: segment.quality,
      notes: segment.notes,
      position: segment.position,
    })),
  };
}

type SegmentInput = z.infer<typeof segmentSchema>;

/**
 * Reject piece references that aren't in the caller's own library — otherwise a
 * crafted id could attach someone else's piece to this user's log.
 */
async function assertPiecesOwned(
  userId: string,
  segments: SegmentInput[],
): Promise<void> {
  const ids = [...new Set(segments.map((s) => s.pieceId).filter((id): id is string => !!id))];
  if (ids.length === 0) return;

  const owned = await prisma.piece.count({ where: { id: { in: ids }, userId } });
  if (owned !== ids.length) {
    throw new HttpError(404, "One or more pieces were not found");
  }
}

function toSegmentRows(segments: SegmentInput[]) {
  return segments.map((segment, index) => ({
    focusArea: segment.focusArea,
    pieceId: segment.pieceId ?? null,
    label: segment.label ?? null,
    minutes: segment.minutes,
    tempo: segment.tempo ?? null,
    measureFrom: segment.measureFrom ?? null,
    measureTo: segment.measureTo ?? null,
    hands: segment.hands ?? null,
    metronome: segment.metronome,
    quality: segment.quality ?? null,
    notes: segment.notes ?? null,
    position: index,
  }));
}

const totalOf = (segments: SegmentInput[]) =>
  segments.reduce((sum, segment) => sum + segment.minutes, 0);

export async function listSessions(req: Request, res: Response): Promise<void> {
  const { from, to, pieceId, limit } = listQuerySchema.parse(req.query);

  const where: Prisma.PracticeSessionWhereInput = { userId: req.userId! };
  if (from || to) {
    where.date = {
      ...(from ? { gte: parseDay(from) } : {}),
      ...(to ? { lte: parseDay(to) } : {}),
    };
  }
  if (pieceId) where.segments = { some: { pieceId } };

  const sessions = await prisma.practiceSession.findMany({
    where,
    include: sessionWithSegments,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  res.json({ sessions: sessions.map(serialize) });
}

export async function getSession(req: Request, res: Response): Promise<void> {
  const session = await prisma.practiceSession.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: sessionWithSegments,
  });

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json({ session: serialize(session) });
}

export async function createSession(req: Request, res: Response): Promise<void> {
  const body = sessionSchema.parse(req.body);
  const userId = req.userId!;
  await assertPiecesOwned(userId, body.segments);

  const session = await prisma.practiceSession.create({
    data: {
      userId,
      date: parseDay(body.date),
      totalMinutes: totalOf(body.segments),
      mood: body.mood ?? null,
      focus: body.focus ?? null,
      notes: body.notes ?? null,
      segments: { create: toSegmentRows(body.segments) },
    },
    include: sessionWithSegments,
  });

  res.status(201).json({ session: serialize(session) });
}

export async function updateSession(req: Request, res: Response): Promise<void> {
  const body = sessionSchema.parse(req.body);
  const userId = req.userId!;
  const id = req.params.id;

  const existing = await prisma.practiceSession.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  await assertPiecesOwned(userId, body.segments);

  // Segments are edited as a set, so replacing them wholesale keeps `position`
  // honest without diffing rows the client may have reordered or dropped.
  const session = await prisma.$transaction(async (tx) => {
    await tx.practiceSegment.deleteMany({ where: { sessionId: id } });
    return tx.practiceSession.update({
      where: { id },
      data: {
        date: parseDay(body.date),
        totalMinutes: totalOf(body.segments),
        mood: body.mood ?? null,
        focus: body.focus ?? null,
        notes: body.notes ?? null,
        segments: { create: toSegmentRows(body.segments) },
      },
      include: sessionWithSegments,
    });
  });

  res.json({ session: serialize(session) });
}

export async function deleteSession(req: Request, res: Response): Promise<void> {
  const { count } = await prisma.practiceSession.deleteMany({
    where: { id: req.params.id, userId: req.userId! },
  });

  if (count === 0) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.status(204).end();
}

/**
 * The dashboard's opening question: did I practise today, and how does the week
 * look? Kept separate from the full insights payload so the home screen is one
 * cheap request.
 */
export async function getToday(req: Request, res: Response): Promise<void> {
  const today = resolveToday(req.query.today);
  const sessions = await prisma.practiceSession.findMany({
    where: { userId: req.userId!, date: today },
    include: sessionWithSegments,
    orderBy: { createdAt: "asc" },
  });

  res.json({
    date: dayKey(today),
    sessions: sessions.map(serialize),
    totalMinutes: sessions.reduce((sum, s) => sum + s.totalMinutes, 0),
  });
}
