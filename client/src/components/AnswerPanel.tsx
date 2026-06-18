import { useState } from "react";

// Shown after an answer is chosen: the result, an optional reveal line (used by
// Ear Training to show what was played), a toggleable explanation, and a manual
// Next button. Mounted only while a question is answered, so its open/closed
// explanation state resets naturally on the next question.
export function AnswerPanel({
  isCorrect,
  correctAnswer,
  explanation,
  reveal,
  onNext,
}: {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  reveal?: string;
  onNext: () => void;
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="mt-5 space-y-3 text-left">
      <div
        className={`rounded-xl border px-4 py-3 ${
          isCorrect
            ? "border-emerald-400/30 bg-emerald-500/10"
            : "border-rose-400/30 bg-rose-500/10"
        }`}
      >
        <p
          className={`font-display text-lg font-semibold ${
            isCorrect ? "text-emerald-400" : "text-rose-300"
          }`}
        >
          {isCorrect ? "✓ Correct!" : `✗ Answer: ${correctAnswer}`}
        </p>
        {reveal && <p className="mt-0.5 text-sm text-zinc-400">{reveal}</p>}
      </div>

      <button
        onClick={() => setShowExplanation((s) => !s)}
        className="btn-ghost w-full text-sm"
      >
        {showExplanation ? "Hide explanation" : "💡 Show explanation"}
      </button>

      {showExplanation && (
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-zinc-300">
          {explanation}
        </p>
      )}

      <button onClick={onNext} className="btn-primary w-full">
        Next question →
      </button>
    </div>
  );
}
