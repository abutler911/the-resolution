import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Lesson, LessonSummary } from "../types";

export default function LessonsPage() {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [active, setActive] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ lessons: LessonSummary[] }>("/lessons")
      .then((data) => setLessons(data.lessons))
      .finally(() => setLoading(false));
  }, []);

  async function openLesson(slug: string) {
    const data = await api<{ lesson: Lesson }>(`/lessons/${slug}`);
    setActive(data.lesson);
  }

  if (loading) return <p className="text-slate-500">Loading lessons…</p>;

  const grouped = groupByCategory(lessons);

  return (
    <div className="grid gap-8 md:grid-cols-[260px_1fr]">
      <aside className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {category}
            </h3>
            <ul className="space-y-1">
              {items.map((lesson) => (
                <li key={lesson.id}>
                  <button
                    onClick={() => openLesson(lesson.slug)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                      active?.slug === lesson.slug
                        ? "bg-tension text-white"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    {lesson.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      <article className="card">
        {active ? (
          <>
            <h1 className="font-display text-2xl font-bold text-tension">
              {active.title}
            </h1>
            <p className="mt-1 text-slate-600">{active.summary}</p>
            <hr className="my-4" />
            {/* Markdown is rendered as plain text for now — drop in a
                markdown renderer (e.g. react-markdown) when ready. */}
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
              {active.body}
            </pre>
          </>
        ) : (
          <p className="text-slate-500">
            Select a lesson from the left to begin.
          </p>
        )}
      </article>
    </div>
  );
}

function groupByCategory(
  lessons: LessonSummary[],
): Record<string, LessonSummary[]> {
  return lessons.reduce<Record<string, LessonSummary[]>>((acc, lesson) => {
    (acc[lesson.category] ??= []).push(lesson);
    return acc;
  }, {});
}
