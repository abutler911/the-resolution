import type { QuizStats } from "../hooks/useQuiz";
import type { ExerciseType } from "../types";

const TYPES: { value: ExerciseType; label: string }[] = [
  { value: "INTERVAL", label: "Intervals" },
  { value: "CHORD_QUALITY", label: "Chords" },
  { value: "SCALE", label: "Scales" },
];

export function TypeTabs({
  value,
  onChange,
}: {
  value: ExerciseType;
  onChange: (type: ExerciseType) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
      {TYPES.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            value === t.value
              ? "bg-brand text-white shadow-glow"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Scoreboard({ stats }: { stats: QuizStats }) {
  const pct = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
  return (
    <div className="flex items-stretch gap-2 text-center">
      <Stat label="Score" value={`${stats.correct}/${stats.total}`} />
      <Stat label="Accuracy" value={`${pct}%`} />
      <Stat label="Streak" value={`${stats.streak}🔥`} accent />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
      <div
        className={`font-mono text-base font-bold leading-none ${
          accent ? "text-resolve" : "text-tension"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </div>
    </div>
  );
}

function choiceClass(
  choice: string,
  selected: string | null,
  correct: string,
): string {
  const base =
    "btn w-full justify-start gap-3 py-3.5 text-base sm:text-sm transition";
  if (!selected) return `${base} btn-ghost`;
  if (choice === correct)
    return `${base} border-emerald-400/40 bg-emerald-500/90 text-white shadow-[0_0_24px_-6px_rgba(16,185,129,0.7)]`;
  if (choice === selected)
    return `${base} border-rose-400/40 bg-rose-500/90 text-white`;
  return `${base} btn-ghost opacity-40`;
}

export function ChoiceGrid({
  choices,
  selected,
  correctAnswer,
  onAnswer,
}: {
  choices: string[];
  selected: string | null;
  correctAnswer: string;
  onAnswer: (choice: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {choices.map((choice, i) => (
        <button
          key={choice}
          onClick={() => onAnswer(choice)}
          disabled={!!selected}
          className={choiceClass(choice, selected, correctAnswer)}
        >
          <kbd
            className={`hidden h-5 w-5 shrink-0 place-items-center rounded font-mono text-xs sm:grid ${
              selected ? "bg-white/20" : "bg-white/10 text-zinc-400"
            }`}
          >
            {i + 1}
          </kbd>
          <span>{choice}</span>
        </button>
      ))}
    </div>
  );
}
