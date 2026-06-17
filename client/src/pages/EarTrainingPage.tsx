import { useCallback, useEffect, useState } from "react";
import { ChoiceGrid, Scoreboard, TypeTabs } from "../components/QuizControls";
import { playNotes, type PlayMode } from "../lib/audio";
import { useQuiz, useQuizKeys } from "../hooks/useQuiz";
import type { ExerciseType, Question } from "../types";

// Chords are most recognizable played together; melodies one note at a time.
function defaultMode(type: ExerciseType): PlayMode {
  return type === "CHORD_QUALITY" ? "harmonic" : "melodic";
}

export default function EarTrainingPage() {
  const [type, setType] = useState<ExerciseType>("INTERVAL");
  const { question, selected, stats, loadQuestion, answer, isCorrect, user } =
    useQuiz(type);
  const [started, setStarted] = useState(false);

  function play(q: Question, mode?: PlayMode) {
    void playNotes(q.midi, mode ?? defaultMode(q.type));
  }

  // Load the next question and play it. Triggered from a user gesture (button
  // or auto-advance after the unlocking first click), so audio is allowed.
  const next = useCallback(async () => {
    const q = await loadQuestion();
    play(q);
  }, [loadQuestion]);

  function start() {
    setStarted(true);
    if (question) play(question);
    else void next();
  }

  // Auto-advance after a correct answer.
  useEffect(() => {
    if (started && selected && isCorrect) {
      const t = setTimeout(() => void next(), 900);
      return () => clearTimeout(t);
    }
  }, [started, selected, isCorrect, next]);

  useQuizKeys({
    enabled: started && !!question,
    answered: !!selected,
    choices: question?.choices ?? [],
    onAnswer: answer,
    onNext: () => void next(),
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TypeTabs
          value={type}
          onChange={(t) => {
            setType(t);
            setStarted(false);
          }}
        />
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
        {!started || !question ? (
          <div className="py-8">
            <p className="mb-4 text-slate-600">
              Listen and identify what you hear — no notes shown.
            </p>
            <button onClick={start} className="btn-primary">
              ▶ Start ear training
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs uppercase tracking-wide text-slate-400">
              {question.type.replace("_", " ")} — by ear
            </p>

            <div className="mb-6 flex justify-center gap-2">
              <button
                onClick={() => play(question, "melodic")}
                className="btn-ghost text-sm"
              >
                🔊 Melodic
              </button>
              <button
                onClick={() => play(question, "harmonic")}
                className="btn-ghost text-sm"
              >
                🔊 Harmonic
              </button>
            </div>

            <ChoiceGrid
              choices={question.choices}
              selected={selected}
              correctAnswer={question.correctAnswer}
              onAnswer={answer}
            />

            <div className="mt-5 min-h-[2.5rem]">
              {selected &&
                (isCorrect ? (
                  <p className="font-medium text-emerald-600">
                    ✓ {question.prompt}
                  </p>
                ) : (
                  <button onClick={() => void next()} className="btn-accent w-full">
                    {question.prompt} — Next →
                  </button>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
