/**
 * The practice diary: every session, newest first, with each segment spelled
 * out — the record you scroll back through when you want to know what you
 * actually did about a passage three weeks ago.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorNote, Spinner } from "../../components/ui";
import { listSessions } from "../../api/practice";
import {
  FOCUS_META,
  HANDS_LABELS,
  formatMinutes,
  formatDay,
  relativeDay,
} from "../../lib/practice";
import type { PracticeSegment, PracticeSession } from "../../types";

const QUALITY_WORDS = ["Rough", "Shaky", "OK", "Good", "Great"];

export default function SessionsPage() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listSessions({ limit: 200 })
      .then(setSessions)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load your practice history"),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return sessions;
    return sessions.filter((session) => {
      const haystack = [
        session.notes ?? "",
        ...session.segments.flatMap((segment) => [
          segment.pieceTitle ?? "",
          segment.label ?? "",
          segment.notes ?? "",
          FOCUS_META[segment.focusArea].label,
        ]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [sessions, query]);

  const totalMinutes = useMemo(
    () => sessions.reduce((sum, session) => sum + session.totalMinutes, 0),
    [sessions],
  );

  if (loading) return <Spinner label="Turning back the pages…" />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Practice history</h1>
          <p className="mt-1 text-zinc-400">
            {sessions.length === 0
              ? "Every session you log lands here."
              : `${sessions.length} sessions · ${formatMinutes(totalMinutes)} at the piano.`}
          </p>
        </div>
        <Link to="/practice/log" className="btn-primary">
          Log practice
        </Link>
      </header>

      {error && <ErrorNote message={error} />}

      {sessions.length > 0 && (
        <label className="block">
          <span className="sr-only">Search your practice history</span>
          <input
            className="input"
            type="search"
            placeholder="Search pieces, notes, focus areas…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      )}

      {sessions.length === 0 ? (
        <EmptyState
          title="Nothing logged yet"
          body="Once you start logging sessions, this becomes a searchable diary of everything you've worked on."
          action={
            <Link to="/practice/log" className="btn-primary">
              Log your first session
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing matches “{query}”.</p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SessionCard({ session }: { session: PracticeSession }) {
  return (
    <li className="card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-display text-base font-semibold">{relativeDay(session.date)}</h2>
          <p className="text-xs text-zinc-500">{formatDay(session.date, "long")}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-zinc-300">
            {formatMinutes(session.totalMinutes)}
          </span>
          <Link
            to={`/practice/log/${session.id}`}
            className="text-xs text-zinc-400 hover:text-zinc-100"
          >
            Edit
          </Link>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {session.segments.map((segment) => (
          <SegmentRow key={segment.id} segment={segment} />
        ))}
      </ul>

      {(session.mood || session.focus || session.notes) && (
        <div className="mt-4 border-t border-white/10 pt-3">
          {(session.mood || session.focus) && (
            <p className="text-xs text-zinc-500">
              {session.mood ? `Energy ${session.mood}/5` : ""}
              {session.mood && session.focus ? " · " : ""}
              {session.focus ? `Concentration ${session.focus}/5` : ""}
            </p>
          )}
          {session.notes && (
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-zinc-300">{session.notes}</p>
          )}
        </div>
      )}
    </li>
  );
}

function SegmentRow({ segment }: { segment: PracticeSegment }) {
  const meta = FOCUS_META[segment.focusArea];
  const title = segment.pieceTitle || segment.label || meta.label;

  const facts = [
    segment.tempo ? `${segment.tempo} bpm` : null,
    segment.measureFrom
      ? `bars ${segment.measureFrom}${segment.measureTo ? `–${segment.measureTo}` : "+"}`
      : null,
    segment.hands ? HANDS_LABELS[segment.hands] : null,
    segment.metronome ? "with metronome" : null,
    segment.quality ? `${QUALITY_WORDS[segment.quality - 1]} (${segment.quality}/5)` : null,
  ].filter(Boolean) as string[];

  return (
    <li className="flex gap-3">
      <span
        aria-hidden
        className="mt-1 h-full w-1 shrink-0 rounded-full"
        style={{ backgroundColor: meta.color, minHeight: "2.25rem" }}
      />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-medium text-zinc-100">{title}</span>
          <span className="font-mono text-xs text-zinc-400">{segment.minutes}m</span>
          {segment.pieceTitle && segment.label && (
            <span className="text-xs text-zinc-500">{segment.label}</span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {meta.label}
          {facts.length > 0 && ` · ${facts.join(" · ")}`}
        </p>
        {segment.notes && (
          <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-400">{segment.notes}</p>
        )}
      </div>
    </li>
  );
}
