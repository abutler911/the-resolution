import { useState } from "react";
import { ChoiceGrid, TypeTabs } from "../components/QuizControls";
import { playNotes, type PlayMode } from "../lib/audio";
import { useQuiz } from "../hooks/useQuiz";
import type { ExerciseType, Question } from "../types";

// Chords are most recognizable played together; melodies one note at a time.
function defaultMode(type: ExerciseType): PlayMode {
  return type === "CHORD_QUALITY" ? "harmonic" : "melodic";
}

export default function EarTrainingPage() {
  const [type, setType] = useState<ExerciseType>("INTERVAL");
  const { question, selected, score, loadQuestion, answer, user } =
    useQuiz(type);
  const [started, setStarted] = useState(false);

  // Load the next question and play it. Triggered from a click, so audio is
  // unlocked by the user gesture.
  async function next() {
    const q = await loadQuestion();
    setStarted(true);
    void playNotes(q.midi, defaultMode(q.type));
  }

  function replay(mode: PlayMode, q: Question) {
    void playNotes(q.midi, mode);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <TypeTabs
          value={type}
          onChange={(t) => {
            setType(t);
            setStarted(false);
          }}
        />
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
        {!started || !question ? (
          <div className="py-8">
            <p className="mb-4 text-slate-600">
              Listen and identify what you hear — no notes shown.
            </p>
            <button onClick={next} className="btn-primary">
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
                onClick={() => replay("melodic", question)}
                className="btn-ghost text-sm"
              >
                🔊 Melodic
              </button>
              <button
                onClick={() => replay("harmonic", question)}
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
              <>
                <p className="mt-6 text-sm text-slate-500">
                  {question.prompt}
                </p>
                <button onClick={next} className="btn-accent mt-4 w-full">
                  Next question →
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
