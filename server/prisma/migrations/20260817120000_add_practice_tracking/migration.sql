-- CreateEnum
CREATE TYPE "PieceKind" AS ENUM ('REPERTOIRE', 'ETUDE', 'EXERCISE', 'SCALE', 'IMPROV', 'OTHER');

-- CreateEnum
CREATE TYPE "PieceStatus" AS ENUM ('WISHLIST', 'LEARNING', 'POLISHING', 'PERFORMANCE_READY', 'MAINTENANCE', 'SHELVED');

-- CreateEnum
CREATE TYPE "FocusArea" AS ENUM ('WARMUP', 'TECHNIQUE', 'SCALES', 'REPERTOIRE', 'SIGHT_READING', 'EAR_TRAINING', 'THEORY', 'IMPROVISATION', 'OTHER');

-- CreateEnum
CREATE TYPE "Hands" AS ENUM ('LEFT', 'RIGHT', 'BOTH');

-- CreateEnum
CREATE TYPE "GoalMetric" AS ENUM ('MINUTES', 'SESSIONS', 'DAYS', 'TEMPO');

-- CreateEnum
CREATE TYPE "GoalPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'TOTAL');

-- CreateTable
CREATE TABLE "Piece" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "composer" TEXT,
    "kind" "PieceKind" NOT NULL DEFAULT 'REPERTOIRE',
    "status" "PieceStatus" NOT NULL DEFAULT 'LEARNING',
    "keySignature" TEXT,
    "targetTempo" INTEGER,
    "notes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Piece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "mood" INTEGER,
    "focus" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeSegment" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "focusArea" "FocusArea" NOT NULL DEFAULT 'REPERTOIRE',
    "pieceId" TEXT,
    "label" TEXT,
    "minutes" INTEGER NOT NULL,
    "tempo" INTEGER,
    "measureFrom" INTEGER,
    "measureTo" INTEGER,
    "hands" "Hands",
    "metronome" BOOLEAN NOT NULL DEFAULT false,
    "quality" INTEGER,
    "notes" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PracticeSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metric" "GoalMetric" NOT NULL DEFAULT 'MINUTES',
    "period" "GoalPeriod" NOT NULL DEFAULT 'WEEKLY',
    "target" INTEGER NOT NULL,
    "focusArea" "FocusArea",
    "pieceId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Piece_userId_status_idx" ON "Piece"("userId", "status");

-- CreateIndex
CREATE INDEX "PracticeSession_userId_date_idx" ON "PracticeSession"("userId", "date");

-- CreateIndex
CREATE INDEX "PracticeSegment_sessionId_idx" ON "PracticeSegment"("sessionId");

-- CreateIndex
CREATE INDEX "PracticeSegment_pieceId_idx" ON "PracticeSegment"("pieceId");

-- CreateIndex
CREATE INDEX "PracticeGoal_userId_archivedAt_idx" ON "PracticeGoal"("userId", "archivedAt");

-- AddForeignKey
ALTER TABLE "Piece" ADD CONSTRAINT "Piece_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSegment" ADD CONSTRAINT "PracticeSegment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PracticeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSegment" ADD CONSTRAINT "PracticeSegment_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Piece"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeGoal" ADD CONSTRAINT "PracticeGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeGoal" ADD CONSTRAINT "PracticeGoal_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Piece"("id") ON DELETE CASCADE ON UPDATE CASCADE;

