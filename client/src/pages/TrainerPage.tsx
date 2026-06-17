import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { ExerciseType, Question } from "../types";

const TYPES: { value: ExerciseType; label: string }[] = [
  { value: "INTERVAL", label: "Intervals" },
  { value: "CHORD_QUALITY", label: "Chords" },
  { value: "SCALE", label: "Scales" },
];

export default function TrainerPage() {
  const { user } = useAuth();
  const [type, setType] = useState<ExerciseType>("INTERVAL");
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const loadQuestion = useCallback(async () => {
    setSelected(null);
    const q = await api<Question>(`/exercises/question?type=${type}`);
    setQuestion(q);
  }, [type]);

  useEffect(() => {
    void loadQuestion();
  }, [loadQuestion]);

  async function handleAnswer(choice: string) {
    if (selected || !question) return;
    setSelected(choice);
    const isCorrect = choice === question.correctAnswer;
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }));

    // Record the attempt for signed-in users (fire and forget).
    if (user) {
      api("/exercises/attempts", {
        method: "POST",
        body: JSON.stringify({
          type: question.type,
          prompt: question.prompt,
          answer: choice,
          correctAnswer: question.correctAnswer,
        }),
      }).catch(() => undefined);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={
                type === t.value ? "btn-primary text-sm" : "btn-ghost text-sm"
              }
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-slate-500">
          {score.correct}/{score.total}
        </span>
      </div>

      {!user && (
        <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          You're practicing as a guest.{" "}
          <a href="/register" className="font-medium underline">
            Sign up
          </a>{" "}
          to save your progress.
        </p>
      )}

      <div className="card text-center">
        {question ? (
          <>
            <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">
              {question.type.replace("_", " ")}
            </p>
            <h2 className="font-display text-2xl font-semibold">
              {question.prompt}
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {question.choices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => handleAnswer(choice)}
                  disabled={!!selected}
                  className={choiceClass(choice, selected, question.correctAnswer)}
                >
                  {choice}
                </button>
              ))}
            </div>

            {selected && (
              <button onClick={loadQuestion} className="btn-accent mt-6 w-full">
                Next question →
              </button>
            )}
          </>
        ) : (
          <p className="text-slate-500">Loading question…</p>
        )}
      </div>
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
