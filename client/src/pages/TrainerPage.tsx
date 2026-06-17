import { useCallback, useEffect, useState } from "react";
import { ChoiceGrid, Scoreboard, TypeTabs } from "../components/QuizControls";
import { playNotes } from "../lib/audio";
import { useQuiz, useQuizKeys } from "../hooks/useQuiz";
import type { ExerciseType } from "../types";

export default function TrainerPage() {
  const [type, setType] = useState<ExerciseType>("INTERVAL");
  const { question, selected, stats, loading, loadQuestion, answer, isCorrect, user } =
    useQuiz(type);

  const next = useCallback(() => {
    void loadQuestion();
  }, [loadQuestion]);

  // Auto-advance after a correct answer; on a wrong one, pause so the player
  // can study the right answer and continue when ready.
  useEffect(() => {
    if (selected && isCorrect) {
      const t = setTimeout(next, 850);
      return () => clearTimeout(t);
    }
  }, [selected, isCorrect, next]);

  useQuizKeys({
    enabled: !loading && !!question,
    answered: !!selected,
    choices: question?.choices ?? [],
    onAnswer: answer,
    onNext: next,
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TypeTabs value={type} onChange={setType} />
        <Scoreboard stats={stats} />
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

            <div className="mt-5 min-h-[2.5rem]">
              {selected &&
                (isCorrect ? (
                  <p className="font-medium text-emerald-600">
                    ✓ Correct! Next up…
                  </p>
                ) : (
                  <button onClick={next} className="btn-accent w-full">
                    Answer: {question.correctAnswer} — Next →
                  </button>
                ))}
            </div>
          </>
        ) : (
          <p className="text-slate-500">Loading question…</p>
        )}
      </div>

      <p className="text-center text-xs text-slate-400">
        Tip: press <kbd className="rounded bg-slate-100 px-1">1</kbd>–
        <kbd className="rounded bg-slate-100 px-1">4</kbd> to answer,{" "}
        <kbd className="rounded bg-slate-100 px-1">Enter</kbd> for next.
      </p>
    </div>
  );
}
