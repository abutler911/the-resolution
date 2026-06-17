export interface User {
  id: string;
  email: string;
  displayName: string;
}

export type ExerciseType = "INTERVAL" | "CHORD_QUALITY" | "SCALE";

export interface Question {
  type: ExerciseType;
  prompt: string;
  notes: string[];
  midi: number[];
  correctAnswer: string;
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
