import { useMemo, useState } from "react";
import {
  GLOSSARY,
  type GlossaryCategory,
  type GlossaryTerm,
} from "../data/glossary";

const CATEGORIES: (GlossaryCategory | "All")[] = [
  "All",
  "Fundamentals",
  "Notation",
  "Intervals",
  "Chords",
  "Scales & Modes",
  "Harmony",
  "Rhythm",
];

function matches(term: GlossaryTerm, q: string): boolean {
  if (!q) return true;
  const haystack = [
    term.term,
    ...(term.aliases ?? []),
    term.definition,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

// Name/alias hits rank above definition-only hits.
function score(term: GlossaryTerm, q: string): number {
  if (!q) return 0;
  if (term.term.toLowerCase().includes(q)) return 0;
  if ((term.aliases ?? []).some((a) => a.toLowerCase().includes(q))) return 1;
  return 2;
}

export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GlossaryCategory | "All">("All");

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    return GLOSSARY.filter(
      (t) => (category === "All" || t.category === category) && matches(t, q),
    ).sort((a, b) => score(a, q) - score(b, q) || a.term.localeCompare(b.term));
  }, [q, category]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          <span className="gradient-text">Glossary</span>
        </h1>
        <p className="mt-1 text-zinc-400">
          Look up any music theory term — try "semitone", "cadence", or
          "tritone".
        </p>
      </div>

      {/* Search */}
      <div className="sticky top-[57px] z-10 -mx-4 bg-ink-900/80 px-4 py-3 backdrop-blur-xl md:top-[61px]">
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
            🔍
          </span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms…"
            className="input pl-10"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="mt-3 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
                category === c
                  ? "border-transparent bg-brand text-white"
                  : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-zinc-500">
        {results.length} term{results.length === 1 ? "" : "s"}
      </p>

      {results.length === 0 ? (
        <div className="card text-center text-zinc-400">
          No terms match "{query}". Try a different word.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((t) => (
            <article key={t.term} className="card">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-white">
                  {t.term}
                </h2>
                <span className="chip shrink-0">{t.category}</span>
              </div>
              {t.aliases && t.aliases.length > 0 && (
                <p className="mt-0.5 text-xs italic text-zinc-500">
                  also: {t.aliases.join(", ")}
                </p>
              )}
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                {t.definition}
              </p>
              {t.related && t.related.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.related.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setQuery(r);
                        setCategory("All");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-tension transition hover:bg-white/10"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
