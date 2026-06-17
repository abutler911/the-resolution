import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { generateQuestion } from "../lib/musicTheory.js";

const exerciseType = z.enum(["INTERVAL", "CHORD_QUALITY", "SCALE"]);

const generateSchema = z.object({
  type: exerciseType.default("INTERVAL"),
});

const submitSchema = z.object({
  type: exerciseType,
  prompt: z.string().min(1),
  answer: z.string().min(1),
  correctAnswer: z.string().min(1),
});

// Returns a fresh question. The correct answer is included so the client can
// grade instantly; the authoritative record is created on submit.
export function getQuestion(req: Request, res: Response): void {
  const { type } = generateSchema.parse({ type: req.query.type });
  res.json(generateQuestion(type));
}

export async function submitAttempt(
  req: Request,
  res: Response,
): Promise<void> {
  const { type, prompt, answer, correctAnswer } = submitSchema.parse(req.body);
  const isCorrect = answer === correctAnswer;

  const attempt = await prisma.exerciseAttempt.create({
    data: {
      userId: req.userId!,
      type,
      prompt,
      answer,
      correctAnswer,
      isCorrect,
    },
  });

  res.status(201).json({ isCorrect, attemptId: attempt.id });
}
