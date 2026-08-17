import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { dayKey } from "../lib/practiceDates.js";

const pieceKind = z.enum([
  "REPERTOIRE",
  "ETUDE",
  "EXERCISE",
  "SCALE",
  "IMPROV",
  "OTHER",
]);

const pieceStatus = z.enum([
  "WISHLIST",
  "LEARNING",
  "POLISHING",
  "PERFORMANCE_READY",
  "MAINTENANCE",
  "SHELVED",
]);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value))
    .nullish();

const pieceSchema = z.object({
  title: z.string().trim().min(1).max(200),
  composer: optionalText(120),
  kind: pieceKind.default("REPERTOIRE"),
  status: pieceStatus.default("LEARNING"),
  keySignature: optionalText(40),
  targetTempo: z.number().int().min(20).max(320).nullish(),
  notes: optionalText(4000),
});

// Every field optional on edit, so the status dropdown can patch on its own.
const piecePatchSchema = pieceSchema.partial().extend({
  archived: z.boolean().optional(),
});

/**
 * Per-piece practice totals. One pass over the user's segments beats a query
 * per piece, and a personal practice log is small enough that pulling the
 * segment rows and folding them here stays comfortably fast.
 */
async function loadPieceStats(userId: string) {
  const segments = await prisma.practiceSegment.findMany({
    where: { session: { userId }, pieceId: { not: null } },
    select: {
      pieceId: true,
      minutes: true,
      tempo: true,
      quality: true,
      session: { select: { date: true } },
    },
  });

  const stats = new Map<
    string,
    {
      totalMinutes: number;
      segmentCount: number;
      bestTempo: number | null;
      lastPracticed: Date | null;
      qualitySum: number;
      qualityCount: number;
    }
  >();

  for (const segment of segments) {
    if (!segment.pieceId) continue;
    const entry = stats.get(segment.pieceId) ?? {
      totalMinutes: 0,
      segmentCount: 0,
      bestTempo: null,
      lastPracticed: null,
      qualitySum: 0,
      qualityCount: 0,
    };

    entry.totalMinutes += segment.minutes;
    entry.segmentCount += 1;
    if (segment.tempo != null && (entry.bestTempo == null || segment.tempo > entry.bestTempo)) {
      entry.bestTempo = segment.tempo;
    }
    if (entry.lastPracticed == null || segment.session.date > entry.lastPracticed) {
      entry.lastPracticed = segment.session.date;
    }
    if (segment.quality != null) {
      entry.qualitySum += segment.quality;
      entry.qualityCount += 1;
    }
    stats.set(segment.pieceId, entry);
  }

  return stats;
}

type PieceRecord = Awaited<ReturnType<typeof prisma.piece.findMany>>[number];
type PieceStats = Awaited<ReturnType<typeof loadPieceStats>>;

function serialize(piece: PieceRecord, stats: PieceStats) {
  const stat = stats.get(piece.id);
  return {
    id: piece.id,
    title: piece.title,
    composer: piece.composer,
    kind: piece.kind,
    status: piece.status,
    keySignature: piece.keySignature,
    targetTempo: piece.targetTempo,
    notes: piece.notes,
    archived: piece.archivedAt != null,
    createdAt: piece.createdAt.toISOString(),
    totalMinutes: stat?.totalMinutes ?? 0,
    segmentCount: stat?.segmentCount ?? 0,
    bestTempo: stat?.bestTempo ?? null,
    lastPracticed: stat?.lastPracticed ? dayKey(stat.lastPracticed) : null,
    averageQuality:
      stat && stat.qualityCount > 0
        ? Math.round((stat.qualitySum / stat.qualityCount) * 10) / 10
        : null,
  };
}

export async function listPieces(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const includeArchived = req.query.includeArchived === "true";

  const [pieces, stats] = await Promise.all([
    prisma.piece.findMany({
      where: { userId, ...(includeArchived ? {} : { archivedAt: null }) },
      orderBy: [{ status: "asc" }, { title: "asc" }],
    }),
    loadPieceStats(userId),
  ]);

  res.json({ pieces: pieces.map((piece) => serialize(piece, stats)) });
}

/**
 * A piece with its tempo history — the "am I actually getting faster?" view.
 * Points are the best tempo recorded on each day the piece was worked on.
 */
export async function getPiece(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const piece = await prisma.piece.findFirst({
    where: { id: req.params.id, userId },
  });

  if (!piece) {
    res.status(404).json({ error: "Piece not found" });
    return;
  }

  const segments = await prisma.practiceSegment.findMany({
    where: { pieceId: piece.id, session: { userId } },
    select: {
      minutes: true,
      tempo: true,
      quality: true,
      notes: true,
      measureFrom: true,
      measureTo: true,
      session: { select: { date: true } },
    },
    orderBy: { session: { date: "asc" } },
  });

  const byDay = new Map<string, { minutes: number; bestTempo: number | null }>();
  for (const segment of segments) {
    const key = dayKey(segment.session.date);
    const entry = byDay.get(key) ?? { minutes: 0, bestTempo: null };
    entry.minutes += segment.minutes;
    if (segment.tempo != null && (entry.bestTempo == null || segment.tempo > entry.bestTempo)) {
      entry.bestTempo = segment.tempo;
    }
    byDay.set(key, entry);
  }

  const stats = await loadPieceStats(userId);
  res.json({
    piece: serialize(piece, stats),
    history: [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, entry]) => ({ date, ...entry })),
  });
}

export async function createPiece(req: Request, res: Response): Promise<void> {
  const body = pieceSchema.parse(req.body);

  const piece = await prisma.piece.create({
    data: {
      userId: req.userId!,
      title: body.title,
      composer: body.composer ?? null,
      kind: body.kind,
      status: body.status,
      keySignature: body.keySignature ?? null,
      targetTempo: body.targetTempo ?? null,
      notes: body.notes ?? null,
    },
  });

  res.status(201).json({ piece: serialize(piece, new Map()) });
}

export async function updatePiece(req: Request, res: Response): Promise<void> {
  const body = piecePatchSchema.parse(req.body);
  const userId = req.userId!;

  const existing = await prisma.piece.findFirst({
    where: { id: req.params.id, userId },
    select: { id: true },
  });
  if (!existing) {
    res.status(404).json({ error: "Piece not found" });
    return;
  }

  const { archived, ...fields } = body;
  const piece = await prisma.piece.update({
    where: { id: existing.id },
    data: {
      ...fields,
      ...(archived === undefined ? {} : { archivedAt: archived ? new Date() : null }),
    },
  });

  const stats = await loadPieceStats(userId);
  res.json({ piece: serialize(piece, stats) });
}

export async function deletePiece(req: Request, res: Response): Promise<void> {
  const { count } = await prisma.piece.deleteMany({
    where: { id: req.params.id, userId: req.userId! },
  });

  if (count === 0) {
    res.status(404).json({ error: "Piece not found" });
    return;
  }
  res.status(204).end();
}
