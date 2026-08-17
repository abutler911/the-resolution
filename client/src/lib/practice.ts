/**
 * Labels, colours and formatting shared by every practice screen.
 *
 * The focus-area colours are a categorical palette: one fixed hue per focus
 * area, assigned by identity and never by rank, so a focus area keeps its
 * colour whatever chart it lands in or however the data is sorted. The set was
 * validated against the app's dark surface for colour-vision separation,
 * lightness band, chroma and contrast — change a value here and it needs
 * re-validating as a set, not in isolation.
 */

import type {
  FocusArea,
  GoalMetric,
  GoalPeriod,
  Hands,
  PieceKind,
  PieceStatus,
} from "../types";

export const FOCUS_AREAS: FocusArea[] = [
  "WARMUP",
  "TECHNIQUE",
  "SCALES",
  "REPERTOIRE",
  "SIGHT_READING",
  "EAR_TRAINING",
  "THEORY",
  "IMPROVISATION",
  "OTHER",
];

interface FocusMeta {
  label: string;
  color: string;
  hint: string;
}

export const FOCUS_META: Record<FocusArea, FocusMeta> = {
  WARMUP: { label: "Warm-up", color: "#9085e9", hint: "Getting the hands moving" },
  TECHNIQUE: { label: "Technique", color: "#d95926", hint: "Hanon, Czerny, drills" },
  SCALES: { label: "Scales & arpeggios", color: "#199e70", hint: "Keys, patterns, fluency" },
  REPERTOIRE: { label: "Repertoire", color: "#c98500", hint: "Pieces you're learning" },
  SIGHT_READING: { label: "Sight-reading", color: "#d55181", hint: "New music, first pass" },
  EAR_TRAINING: { label: "Ear training", color: "#008300", hint: "Intervals, chords by ear" },
  THEORY: { label: "Theory", color: "#3987e5", hint: "Harmony, analysis, notation" },
  IMPROVISATION: { label: "Improvisation", color: "#e66767", hint: "Playing without the page" },
  OTHER: { label: "Other", color: "#8b8b9c", hint: "Anything else at the bench" },
};

export const focusLabel = (area: FocusArea): string => FOCUS_META[area].label;
export const focusColor = (area: FocusArea): string => FOCUS_META[area].color;

export const PIECE_KINDS: PieceKind[] = [
  "REPERTOIRE",
  "ETUDE",
  "EXERCISE",
  "SCALE",
  "IMPROV",
  "OTHER",
];

export const PIECE_KIND_LABELS: Record<PieceKind, string> = {
  REPERTOIRE: "Repertoire",
  ETUDE: "Étude",
  EXERCISE: "Exercise",
  SCALE: "Scale",
  IMPROV: "Improv",
  OTHER: "Other",
};

export const PIECE_STATUSES: PieceStatus[] = [
  "WISHLIST",
  "LEARNING",
  "POLISHING",
  "PERFORMANCE_READY",
  "MAINTENANCE",
  "SHELVED",
];

/**
 * Status is an ordered pipeline (wishlist → stage-ready → upkeep), so it gets an
 * ordinal single-hue ramp rather than categorical hues — the darkening steps
 * read as "further along". Shelved sits outside the arc in neutral grey.
 */
export const PIECE_STATUS_META: Record<
  PieceStatus,
  { label: string; color: string; blurb: string }
> = {
  WISHLIST: { label: "Wishlist", color: "#a5b4fc", blurb: "Someday soon" },
  LEARNING: { label: "Learning", color: "#818cf8", blurb: "Notes and fingering" },
  POLISHING: { label: "Polishing", color: "#6366f1", blurb: "Musical detail" },
  PERFORMANCE_READY: { label: "Performance ready", color: "#4f46e5", blurb: "Ready to play for people" },
  MAINTENANCE: { label: "Maintenance", color: "#4338ca", blurb: "Keeping it in the fingers" },
  SHELVED: { label: "Shelved", color: "#8b8b9c", blurb: "Resting for now" },
};

export const HANDS_LABELS: Record<Hands, string> = {
  LEFT: "Left hand",
  RIGHT: "Right hand",
  BOTH: "Hands together",
};

export const GOAL_METRIC_LABELS: Record<GoalMetric, string> = {
  MINUTES: "Minutes practised",
  SESSIONS: "Practice sessions",
  DAYS: "Days practised",
  TEMPO: "Tempo reached",
};

export const GOAL_PERIOD_LABELS: Record<GoalPeriod, string> = {
  DAILY: "Every day",
  WEEKLY: "Every week",
  MONTHLY: "Every month",
  TOTAL: "Overall",
};

export const goalUnit = (metric: GoalMetric): string =>
  metric === "MINUTES" ? "min" : metric === "TEMPO" ? "bpm" : metric === "DAYS" ? "days" : "sessions";

/* --------------------------------------------------------------------------
 * Dates — the client works in the player's local calendar day
 * ----------------------------------------------------------------------- */

/** Today where the player is sitting, as the `YYYY-MM-DD` key the API expects. */
export function localDayKey(date: Date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

/** Parse a day key back into a local-noon Date, safe from timezone drift. */
export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year!, (month ?? 1) - 1, day ?? 1, 12);
}

export function addDayKey(key: string, days: number): string {
  const date = parseDayKey(key);
  date.setDate(date.getDate() + days);
  return localDayKey(date);
}

export function formatDay(key: string, style: "short" | "long" = "short"): string {
  return parseDayKey(key).toLocaleDateString(undefined, {
    weekday: style === "long" ? "long" : "short",
    month: "short",
    day: "numeric",
    ...(style === "long" ? { year: "numeric" } : {}),
  });
}

/** "Today" / "Yesterday" / a date — how a practice log reads to a human. */
export function relativeDay(key: string): string {
  const today = localDayKey();
  if (key === today) return "Today";
  if (key === addDayKey(today, -1)) return "Yesterday";
  const days = Math.round(
    (parseDayKey(today).getTime() - parseDayKey(key).getTime()) / 86_400_000,
  );
  if (days > 1 && days < 7) return `${days} days ago`;
  return formatDay(key);
}

/* --------------------------------------------------------------------------
 * Formatting
 * ----------------------------------------------------------------------- */

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

/** Seconds as a running clock: 5:04, or 1:05:04 once it passes an hour. */
export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
}

/** What a segment is called when it has no linked piece. */
export function segmentTitle(segment: {
  pieceTitle?: string | null;
  label?: string | null;
  focusArea: FocusArea;
}): string {
  return segment.pieceTitle || segment.label || focusLabel(segment.focusArea);
}
