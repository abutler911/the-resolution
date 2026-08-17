/**
 * Log a practice session — the screen this whole app exists for.
 *
 * The shape of the form mirrors how practice actually happens: you sit down,
 * you work on a handful of specific things, and afterwards you have an opinion
 * about how it went. Each of those things is a segment; the session wraps them.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PracticeTimer from "../../components/PracticeTimer";
import SegmentEditor from "../../components/SegmentEditor";
import { ErrorNote, Field, Rating, Spinner } from "../../components/ui";
import {
  createSession,
  deleteSession,
  getSession,
  listPieces,
  updateSession,
  type SegmentPayload,
} from "../../api/practice";
import {
  FOCUS_META,
  formatMinutes,
  localDayKey,
  relativeDay,
} from "../../lib/practice";
import type { Piece, PracticeSegment, SegmentDraft } from "../../types";

let draftCounter = 0;
const nextKey = () => `draft-${++draftCounter}`;

function emptyDraft(overrides: Partial<SegmentDraft> = {}): SegmentDraft {
  return {
    key: nextKey(),
    focusArea: "REPERTOIRE",
    pieceId: null,
    label: "",
    minutes: 15,
    tempo: null,
    measureFrom: null,
    measureTo: null,
    hands: null,
    metronome: false,
    quality: null,
    notes: "",
    ...overrides,
  };
}

function toDraft(segment: PracticeSegment): SegmentDraft {
  return {
    key: nextKey(),
    focusArea: segment.focusArea,
    pieceId: segment.pieceId,
    label: segment.label ?? "",
    minutes: segment.minutes,
    tempo: segment.tempo,
    measureFrom: segment.measureFrom,
    measureTo: segment.measureTo,
    hands: segment.hands,
    metronome: segment.metronome,
    quality: segment.quality,
    notes: segment.notes ?? "",
  };
}

function toPayload(draft: SegmentDraft): SegmentPayload {
  return {
    focusArea: draft.focusArea,
    pieceId: draft.pieceId,
    label: draft.label.trim() || null,
    minutes: draft.minutes,
    tempo: draft.tempo,
    measureFrom: draft.measureFrom,
    measureTo: draft.measureTo,
    hands: draft.hands,
    metronome: draft.metronome,
    quality: draft.quality,
    notes: draft.notes.trim() || null,
  };
}

export default function LogSessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [pieces, setPieces] = useState<Piece[]>([]);
  const [date, setDate] = useState(localDayKey());
  const [segments, setSegments] = useState<SegmentDraft[]>([]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [loadedPieces, session] = await Promise.all([
          listPieces(),
          id ? getSession(id) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        setPieces(loadedPieces);
        if (session) {
          setDate(session.date);
          setSegments(session.segments.map(toDraft));
          setMood(session.mood);
          setFocus(session.focus);
          setNotes(session.notes ?? "");
        } else {
          const first = emptyDraft();
          setSegments([first]);
          setOpenKey(first.key);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const totalMinutes = useMemo(
    () => segments.reduce((sum, segment) => sum + (segment.minutes || 0), 0),
    [segments],
  );

  const patchSegment = useCallback((key: string, patch: Partial<SegmentDraft>) => {
    setSegments((current) =>
      current.map((segment) => (segment.key === key ? { ...segment, ...patch } : segment)),
    );
  }, []);

  const addSegment = useCallback(() => {
    // Carry the last segment's focus over — practice tends to come in runs.
    const previous = segments[segments.length - 1];
    const draft = emptyDraft(previous ? { focusArea: previous.focusArea } : {});
    setSegments((current) => [...current, draft]);
    setOpenKey(draft.key);
  }, [segments]);

  const removeSegment = useCallback((key: string) => {
    setSegments((current) => current.filter((segment) => segment.key !== key));
    setOpenKey((current) => (current === key ? null : current));
  }, []);

  /** The timer hands its minutes to whichever segment is open, or a new one. */
  const applyTimerMinutes = useCallback(
    (minutes: number) => {
      if (minutes < 1) return;
      if (openKey) {
        patchSegment(openKey, { minutes });
        return;
      }
      const draft = emptyDraft({
        minutes,
        focusArea: segments[segments.length - 1]?.focusArea ?? "REPERTOIRE",
      });
      setSegments((current) => [...current, draft]);
      setOpenKey(draft.key);
    },
    [openKey, patchSegment, segments],
  );

  const applyTempo = useCallback(
    (bpm: number) => {
      if (openKey) patchSegment(openKey, { tempo: bpm, metronome: true });
    },
    [openKey, patchSegment],
  );

  async function handleSave() {
    const usable = segments.filter((segment) => segment.minutes > 0);
    if (usable.length === 0) {
      setError("Add at least one thing you practised, with the minutes you spent on it.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        date,
        mood,
        focus,
        notes: notes.trim() || null,
        segments: usable.map(toPayload),
      };
      if (id) await updateSession(id, payload);
      else await createSession(payload);
      navigate("/practice");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this session");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm("Delete this practice session? This can't be undone.")) return;
    try {
      await deleteSession(id);
      navigate("/practice");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this session");
    }
  }

  if (loading) return <Spinner label="Loading your practice log…" />;

  return (
    <div className="space-y-6 pb-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            {editing ? "Edit session" : "Log practice"}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {totalMinutes > 0
              ? `${formatMinutes(totalMinutes)} across ${segments.length} ${
                  segments.length === 1 ? "thing" : "things"
                } — ${relativeDay(date)}`
              : "What did you work on?"}
          </p>
        </div>

        <Field label="Date">
          <input
            type="date"
            className="input"
            value={date}
            max={localDayKey()}
            onChange={(event) => setDate(event.target.value || localDayKey())}
          />
        </Field>
      </header>

      {error && <ErrorNote message={error} />}

      {!editing && <PracticeTimer onLogMinutes={applyTimerMinutes} onTempoChange={applyTempo} />}

      <section className="space-y-3">
        {segments.map((segment) =>
          openKey === segment.key ? (
            <SegmentEditor
              key={segment.key}
              segment={segment}
              pieces={pieces}
              onChange={(patch) => patchSegment(segment.key, patch)}
              onRemove={() => removeSegment(segment.key)}
              onDone={() => setOpenKey(null)}
            />
          ) : (
            <SegmentRow
              key={segment.key}
              segment={segment}
              pieces={pieces}
              onEdit={() => setOpenKey(segment.key)}
              onRemove={() => removeSegment(segment.key)}
            />
          ),
        )}

        <button type="button" onClick={addSegment} className="btn-ghost w-full py-3">
          + Add something else you practised
        </button>
      </section>

      <section className="card">
        <h2 className="font-display text-base font-semibold">How was the session?</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field label="Energy">
            <Rating
              value={mood}
              onChange={setMood}
              labels={["Drained", "Flat", "Fine", "Good", "Flying"]}
            />
          </Field>
          <Field label="Concentration">
            <Rating
              value={focus}
              onChange={setFocus}
              labels={["Scattered", "Patchy", "OK", "Sharp", "Locked in"]}
            />
          </Field>
        </div>
        <Field label="Session notes" className="mt-5">
          <textarea
            className="input min-h-[80px] resize-y"
            placeholder="Anything worth remembering next time you sit down…"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={4000}
          />
        </Field>
      </section>

      <div className="sticky bottom-20 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-ink-800/90 p-3 backdrop-blur-xl md:bottom-4">
        <p className="pl-2 text-sm text-zinc-400">
          Total <span className="font-mono text-zinc-100">{formatMinutes(totalMinutes)}</span>
        </p>
        <div className="flex gap-2">
          {editing && (
            <button type="button" onClick={handleDelete} className="btn-ghost text-sm text-red-300">
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-ghost text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || totalMinutes === 0}
            className="btn-primary"
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Save session"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SegmentRow({
  segment,
  pieces,
  onEdit,
  onRemove,
}: {
  segment: SegmentDraft;
  pieces: Piece[];
  onEdit: () => void;
  onRemove: () => void;
}) {
  const piece = pieces.find((p) => p.id === segment.pieceId);
  const title = piece?.title || segment.label || FOCUS_META[segment.focusArea].label;

  const badges = [
    segment.tempo ? `${segment.tempo} bpm` : null,
    segment.measureFrom
      ? `bars ${segment.measureFrom}${segment.measureTo ? `–${segment.measureTo}` : "+"}`
      : null,
    segment.quality ? `${segment.quality}/5` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <span
        aria-hidden
        className="h-8 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: FOCUS_META[segment.focusArea].color }}
      />
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <p className="truncate font-medium text-zinc-100">{title}</p>
        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {FOCUS_META[segment.focusArea].label}
          {badges.length > 0 && ` · ${badges.join(" · ")}`}
        </p>
      </button>
      <span className="shrink-0 font-mono text-sm text-zinc-300">{segment.minutes}m</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${title}`}
        className="shrink-0 rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-red-300"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
