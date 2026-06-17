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

function choiceClass(
  choice: string,
  selected: string | null,
  correct: string,
): string {
  const base = "btn w-full";
  if (!selected) return `${base} btn-ghost`;
  if (choice === correct) return `${base} bg-emerald-500 text-white`;
  if (choice === selected) return `${base} bg-rose-500 text-white`;
  return `${base} btn-ghost opacity-60`;
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
      {choices.map((choice) => (
        <button
          key={choice}
          onClick={() => onAnswer(choice)}
          disabled={!!selected}
          className={choiceClass(choice, selected, correctAnswer)}
        >
          {choice}
        </button>
      ))}
    </div>
  );
}
