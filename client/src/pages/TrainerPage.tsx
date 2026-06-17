import { useEffect, useState } from "react";
import { ChoiceGrid, TypeTabs } from "../components/QuizControls";
import { playNotes } from "../lib/audio";
import { useQuiz } from "../hooks/useQuiz";
import type { ExerciseType } from "../types";

export default function TrainerPage() {
  const [type, setType] = useState<ExerciseType>("INTERVAL");
  const { question, selected, score, loadQuestion, answer, user } =
    useQuiz(type);

  useEffect(() => {
    void loadQuestion();
  }, [loadQuestion]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <TypeTabs value={type} onChange={setType} />
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

            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => playNotes(question.midi, "melodic")}
                className="btn-ghost text-sm"
              >
                ▶ Melodic
              </button>
              <button
                onClick={() => playNotes(question.midi, "harmonic")}
                className="btn-ghost text-sm"
              >
                ▶ Harmonic
              </button>
            </div>

            <div className="mt-6">
              <ChoiceGrid
                choices={question.choices}
                selected={selected}
                correctAnswer={question.correctAnswer}
                onAnswer={answer}
              />
            </div>

            {selected && (
              <button
                onClick={() => loadQuestion()}
                className="btn-accent mt-6 w-full"
              >
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
