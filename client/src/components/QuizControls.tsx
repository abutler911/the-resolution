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
    <div className="flex gap-2">
      {TYPES.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={value === t.value ? "btn-primary text-sm" : "btn-ghost text-sm"}
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
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5">
      <div
        className={`text-base font-bold leading-none ${
          accent ? "text-resolve" : "text-tension"
        }`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
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
  const base = "btn w-full justify-start gap-3";
  if (!selected) return `${base} btn-ghost`;
  if (choice === correct) return `${base} bg-emerald-500 text-white`;
  if (choice === selected) return `${base} bg-rose-500 text-white`;
  return `${base} btn-ghost opacity-50`;
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
    <div className="grid grid-cols-2 gap-3">
      {choices.map((choice, i) => (
        <button
          key={choice}
          onClick={() => onAnswer(choice)}
          disabled={!!selected}
          className={choiceClass(choice, selected, correctAnswer)}
        >
          <kbd
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs ${
              selected ? "bg-white/20" : "bg-slate-100 text-slate-400"
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
