import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { Lesson, LessonProgress, LessonSummary } from "../types";

export default function LessonsPage() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [active, setActive] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load the lesson list, plus this user's completion state when signed in.
  useEffect(() => {
    async function load() {
      const { lessons } = await api<{ lessons: LessonSummary[] }>("/lessons");
      setLessons(lessons);

      if (user) {
        const { progress } = await api<{ progress: LessonProgress[] }>(
          "/progress/lessons",
        );
        setCompleted(
          new Set(progress.filter((p) => p.completed).map((p) => p.lessonId)),
        );
      }
    }
    load().finally(() => setLoading(false));
  }, [user]);

  async function openLesson(slug: string) {
    const { lesson } = await api<{ lesson: Lesson }>(`/lessons/${slug}`);
    setActive(lesson);
  }

  const toggleComplete = useCallback(async () => {
    if (!active) return;
    const next = !completed.has(active.id);
    setSaving(true);
    try {
      await api("/progress/lessons", {
        method: "POST",
        body: JSON.stringify({ lessonId: active.id, completed: next }),
      });
      setCompleted((prev) => {
        const updated = new Set(prev);
        if (next) updated.add(active.id);
        else updated.delete(active.id);
        return updated;
      });
    } finally {
      setSaving(false);
    }
  }, [active, completed]);

  if (loading) return <p className="text-slate-500">Loading lessons…</p>;

  const grouped = groupByCategory(lessons);
  const isDone = active ? completed.has(active.id) : false;

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
                    className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
                      active?.slug === lesson.slug
                        ? "bg-tension text-white"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    <span>{lesson.title}</span>
                    {completed.has(lesson.id) && (
                      <span
                        aria-label="completed"
                        className={
                          active?.slug === lesson.slug
                            ? "text-resolve"
                            : "text-emerald-500"
                        }
                      >
                        ✓
                      </span>
                    )}
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-tension">
                  {active.title}
                </h1>
                <p className="mt-1 text-slate-600">{active.summary}</p>
              </div>
              {user && (
                <button
                  onClick={toggleComplete}
                  disabled={saving}
                  className={isDone ? "btn-ghost shrink-0" : "btn-accent shrink-0"}
                >
                  {isDone ? "✓ Completed" : "Mark complete"}
                </button>
              )}
            </div>
            <hr className="my-4" />
            <div className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-tension">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {active.body}
              </ReactMarkdown>
            </div>
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
