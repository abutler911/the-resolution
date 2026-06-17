import { useCallback, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { ExerciseType, Question } from "../types";

// Shared quiz state for both the Trainer and Ear Training pages: fetches
// questions, tracks the selected answer + running score, and records attempts
// for signed-in users.
export function useQuiz(type: ExerciseType) {
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const loadQuestion = useCallback(async (): Promise<Question> => {
    setSelected(null);
    const q = await api<Question>(`/exercises/question?type=${type}`);
    setQuestion(q);
    return q;
  }, [type]);

  const answer = useCallback(
    (choice: string) => {
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
    },
    [selected, question, user],
  );

  return { question, selected, score, loadQuestion, answer, user };
}
