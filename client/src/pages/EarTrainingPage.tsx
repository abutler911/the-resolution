import { useCallback, useState } from "react";
import { AnswerPanel } from "../components/AnswerPanel";
import {
  AUDIO_TYPES,
  ChoiceGrid,
  Scoreboard,
  TypeTabs,
} from "../components/QuizControls";
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

  useQuizKeys({
    enabled: started && !!question,
    answered: !!selected,
    choices: question?.choices ?? [],
    onAnswer: answer,
    onNext: () => void next(),
  });

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TypeTabs
          value={type}
          options={AUDIO_TYPES}
          onChange={(t) => {
            setType(t);
            setStarted(false);
          }}
        />
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
        {!started || !question ? (
          <div className="py-10">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-brand text-3xl shadow-glow">
              👂
            </div>
            <p className="mb-5 text-zinc-400">
              Listen and identify what you hear — no notes shown.
            </p>
            <button onClick={start} className="btn-primary px-6 py-3 text-base">
              ▶ Start ear training
            </button>
          </div>
        ) : (
          <>
            <p className="chip mb-4 inline-flex">
              {question.type.replace("_", " ").toLowerCase()} · by ear
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

            {selected && (
              <AnswerPanel
                isCorrect={isCorrect}
                correctAnswer={question.correctAnswer}
                explanation={question.explanation}
                reveal={question.prompt}
                onNext={() => void next()}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
