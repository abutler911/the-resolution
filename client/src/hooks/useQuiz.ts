import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { ExerciseType, Question } from "../types";

export interface QuizStats {
  correct: number;
  total: number;
  streak: number;
  best: number;
}

const EMPTY_STATS: QuizStats = { correct: 0, total: 0, streak: 0, best: 0 };

// Shared quiz state for the Trainer and Ear Training pages: fetches questions,
// tracks the selected answer plus running stats (score / streak), and records
// attempts for signed-in users. Auto-loads the first question and reloads when
// the exercise type changes.
export function useQuiz(type: ExerciseType) {
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [stats, setStats] = useState<QuizStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  const loadQuestion = useCallback(async (): Promise<Question> => {
    setLoading(true);
    setSelected(null);
    try {
      const q = await api<Question>(`/exercises/question?type=${type}`);
      setQuestion(q);
      return q;
    } finally {
      setLoading(false);
    }
  }, [type]);

  // Load on mount and whenever the type changes. The ref guard keeps React 18
  // StrictMode's double-invoked effect from firing two requests.
  const loadedType = useRef<ExerciseType | null>(null);
  useEffect(() => {
    if (loadedType.current === type) return;
    loadedType.current = type;
    void loadQuestion();
  }, [type, loadQuestion]);

  const answer = useCallback(
    (choice: string) => {
      if (selected || !question) return;
      setSelected(choice);
      const isCorrect = choice === question.correctAnswer;
      setStats((s) => {
        const streak = isCorrect ? s.streak + 1 : 0;
        return {
          correct: s.correct + (isCorrect ? 1 : 0),
          total: s.total + 1,
          streak,
          best: Math.max(s.best, streak),
        };
      });

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
    },
    [selected, question, user],
  );

  const isCorrect =
    selected != null && question != null && selected === question.correctAnswer;

  return { question, selected, stats, loading, loadQuestion, answer, isCorrect, user };
}

// Keyboard shortcuts for rapid-fire practice: number keys pick an answer,
// Enter/Space advances once answered.
export function useQuizKeys({
  enabled,
  answered,
  choices,
  onAnswer,
  onNext,
}: {
  enabled: boolean;
  answered: boolean;
  choices: string[];
  onAnswer: (choice: string) => void;
  onNext: () => void;
}) {
  useEffect(() => {
    if (!enabled) return;
    function handler(e: KeyboardEvent) {
      if (!answered) {
        const n = Number(e.key);
        if (Number.isInteger(n) && n >= 1 && n <= choices.length) {
          onAnswer(choices[n - 1]);
        }
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onNext();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, answered, choices, onAnswer, onNext]);
}
