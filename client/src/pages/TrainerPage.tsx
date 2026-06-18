import { useCallback, useState } from "react";
import { AnswerPanel } from "../components/AnswerPanel";
import { Piano } from "../components/Piano";
import { ChoiceGrid, Scoreboard, TypeTabs } from "../components/QuizControls";
import { playNotes } from "../lib/audio";
import { useQuiz, useQuizKeys } from "../hooks/useQuiz";
import type { ExerciseType } from "../types";

export default function TrainerPage() {
  const [type, setType] = useState<ExerciseType>("INTERVAL");
  const { question, selected, stats, loadQuestion, answer, isCorrect, user } =
    useQuiz(type);

  const next = useCallback(() => {
    void loadQuestion();
  }, [loadQuestion]);

  useQuizKeys({
    enabled: !!question,
    answered: !!selected,
    choices: question?.choices ?? [],
    onAnswer: answer,
    onNext: next,
  });

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TypeTabs value={type} onChange={setType} />
        <Scoreboard stats={stats} />
      </div>

      {!user && (
        <p className="rounded-xl border border-resolve/20 bg-resolve/10 px-4 py-2.5 text-sm text-resolve">
          Practicing as a guest.{" "}
          <a href="/register" className="font-semibold underline">
            Sign up
          </a>{" "}
          to save progress.
        </p>
      )}

      <div className="card text-center">
        {question ? (
          <>
            <p className="chip mb-3 inline-flex">
              {question.type.replace("_", " ").toLowerCase()}
            </p>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
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

            <div className="mt-5">
              <Piano
                highlight={question.midi}
                to={Math.max(84, ...question.midi)}
              />
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
              <AnswerPanel
                isCorrect={isCorrect}
                correctAnswer={question.correctAnswer}
                explanation={question.explanation}
                onNext={next}
              />
            )}
          </>
        ) : (
          <p className="py-8 text-zinc-500">Loading question…</p>
        )}
      </div>

      <p className="hidden text-center text-xs text-zinc-600 sm:block">
        Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">1</kbd>–
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">4</kbd> to
        answer, <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">Enter</kbd>{" "}
        for next.
      </p>
    </div>
  );
}
