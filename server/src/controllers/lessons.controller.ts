import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";

export async function listLessons(_req: Request, res: Response): Promise<void> {
  const lessons = await prisma.lesson.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      category: true,
      order: true,
    },
  });
  res.json({ lessons });
}

export async function getLesson(req: Request, res: Response): Promise<void> {
  const lesson = await prisma.lesson.findUnique({
    where: { slug: req.params.slug },
  });
  if (!lesson) {
    throw new HttpError(404, "Lesson not found");
  }
  res.json({ lesson });
}
