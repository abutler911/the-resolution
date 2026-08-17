export interface User {
  id: string;
  email: string;
  displayName: string;
}

export type ExerciseType =
  | "INTERVAL"
  | "CHORD_QUALITY"
  | "SCALE"
  | "KEY_SIGNATURE";

export interface Question {
  type: ExerciseType;
  prompt: string;
  notes: string[];
  midi: number[];
  correctAnswer: string;
  explanation: string;
  choices: string[];
}

export type LessonCategory =
  | "FUNDAMENTALS"
  | "INTERVALS"
  | "CHORDS"
  | "SCALES"
  | "HARMONY";

export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: LessonCategory;
  order: number;
}

export interface Lesson extends LessonSummary {
  body: string;
}

export interface ProgressSummary {
  byType: Record<string, { correct: number; total: number }>;
  totals: { correct: number; total: number };
  streak: number;
  completedLessons: number;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
}

/* --------------------------------------------------------------------------
 * Practice tracking
 * ----------------------------------------------------------------------- */

export type FocusArea =
  | "WARMUP"
  | "TECHNIQUE"
  | "SCALES"
  | "REPERTOIRE"
  | "SIGHT_READING"
  | "EAR_TRAINING"
  | "THEORY"
  | "IMPROVISATION"
  | "OTHER";

export type Hands = "LEFT" | "RIGHT" | "BOTH";

export type PieceKind =
  | "REPERTOIRE"
  | "ETUDE"
  | "EXERCISE"
  | "SCALE"
  | "IMPROV"
  | "OTHER";

export type PieceStatus =
  | "WISHLIST"
  | "LEARNING"
  | "POLISHING"
  | "PERFORMANCE_READY"
  | "MAINTENANCE"
  | "SHELVED";

export type GoalMetric = "MINUTES" | "SESSIONS" | "DAYS" | "TEMPO";
export type GoalPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "TOTAL";

export interface PracticeSegment {
  id: string;
  focusArea: FocusArea;
  pieceId: string | null;
  pieceTitle: string | null;
  pieceComposer: string | null;
  label: string | null;
  minutes: number;
  tempo: number | null;
  measureFrom: number | null;
  measureTo: number | null;
  hands: Hands | null;
  metronome: boolean;
  quality: number | null;
  notes: string | null;
  position: number;
}

export interface PracticeSession {
  id: string;
  /** `YYYY-MM-DD` — a calendar day, not an instant. */
  date: string;
  totalMinutes: number;
  mood: number | null;
  focus: number | null;
  notes: string | null;
  createdAt: string;
  segments: PracticeSegment[];
}

/** A segment as the log form holds it, before the server assigns ids. */
export interface SegmentDraft {
  key: string;
  focusArea: FocusArea;
  pieceId: string | null;
  label: string;
  minutes: number;
  tempo: number | null;
  measureFrom: number | null;
  measureTo: number | null;
  hands: Hands | null;
  metronome: boolean;
  quality: number | null;
  notes: string;
}

export interface Piece {
  id: string;
  title: string;
  composer: string | null;
  kind: PieceKind;
  status: PieceStatus;
  keySignature: string | null;
  targetTempo: number | null;
  notes: string | null;
  archived: boolean;
  createdAt: string;
  totalMinutes: number;
  segmentCount: number;
  bestTempo: number | null;
  lastPracticed: string | null;
  averageQuality: number | null;
}

export interface PieceHistoryPoint {
  date: string;
  minutes: number;
  bestTempo: number | null;
}

export interface Goal {
  id: string;
  title: string;
  metric: GoalMetric;
  period: GoalPeriod;
  target: number;
  focusArea: FocusArea | null;
  pieceId: string | null;
  pieceTitle: string | null;
  startDate: string;
  endDate: string | null;
  archived: boolean;
  current: number;
  percent: number;
  met: boolean;
  windowStart: string;
  windowEnd: string;
  daysRemaining: number;
}

export interface DayPoint {
  date: string;
  minutes: number;
  sessions: number;
}

export interface Insights {
  range: { from: string; to: string; days: number };
  totals: {
    minutes: number;
    sessions: number;
    daysPractised: number;
    averageSessionMinutes: number;
    averageDailyMinutes: number;
    averageQuality: number | null;
    metronomeShare: number;
  };
  allTime: {
    minutes: number;
    sessions: number;
    daysPractised: number;
    firstSession: string | null;
  };
  streak: { current: number; longest: number };
  thisWeek: { minutes: number; sessions: number; daysElapsed: number };
  /** Last week measured over the same days elapsed, for a fair comparison. */
  lastWeek: { minutes: number; sessions: number };
  lastWeekTotal: { minutes: number; sessions: number };
  daily: DayPoint[];
  byFocus: Array<{ focusArea: FocusArea; minutes: number; segments: number }>;
  byPiece: Array<{
    pieceId: string;
    title: string;
    composer: string | null;
    minutes: number;
    bestTempo: number | null;
    lastPracticed: string;
  }>;
  weekly: Array<{
    weekStart: string;
    minutes: number;
    averageQuality: number | null;
  }>;
}
