/**
 * The form for one thing you worked on. Everything past "what" and "how long"
 * is optional — the fastest possible log is two taps — but the extra fields are
 * the ones that make the history worth reading back: tempo, the bars you
 * drilled, hands, and how it actually went.
 */

import { FOCUS_AREAS, FOCUS_META, HANDS_LABELS } from "../lib/practice";
import type { Hands, Piece, SegmentDraft } from "../types";
import { Field, Rating } from "./ui";

const HANDS_OPTIONS: Hands[] = ["LEFT", "RIGHT", "BOTH"];

/** Number inputs come back as strings; empty means "not recorded", not zero. */
function toNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function SegmentEditor({
  segment,
  pieces,
  onChange,
  onRemove,
  onDone,
}: {
  segment: SegmentDraft;
  pieces: Piece[];
  onChange: (patch: Partial<SegmentDraft>) => void;
  onRemove: () => void;
  onDone: () => void;
}) {
  return (
    <div className="rounded-2xl border border-tension/40 bg-tension/[0.06] p-4 sm:p-5">
      <fieldset>
        <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
          Focus
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {FOCUS_AREAS.map((area) => {
            const active = segment.focusArea === area;
            const meta = FOCUS_META[area];
            return (
              <button
                key={area}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ focusArea: area })}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-white/30 bg-white/15 text-white"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/25 hover:text-zinc-100"
                }`}
              >
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                {meta.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Piece" hint={pieces.length === 0 ? "Add pieces in Repertoire to track them over time" : undefined}>
          <select
            className="input"
            value={segment.pieceId ?? ""}
            onChange={(event) => onChange({ pieceId: event.target.value || null })}
          >
            <option value="">— not a tracked piece —</option>
            {pieces.map((piece) => (
              <option key={piece.id} value={piece.id}>
                {piece.title}
                {piece.composer ? ` — ${piece.composer}` : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label={segment.pieceId ? "Detail" : "What did you work on?"}>
          <input
            className="input"
            placeholder={segment.pieceId ? "Left-hand leaps, bars 40–56…" : "C♯ minor scale, Hanon 3…"}
            value={segment.label}
            onChange={(event) => onChange({ label: event.target.value })}
            maxLength={200}
          />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Minutes">
          <input
            className="input"
            type="number"
            inputMode="numeric"
            min={1}
            max={720}
            value={segment.minutes || ""}
            onChange={(event) => onChange({ minutes: toNumber(event.target.value) ?? 0 })}
          />
        </Field>

        <Field label="Tempo" hint="bpm">
          <input
            className="input"
            type="number"
            inputMode="numeric"
            min={20}
            max={320}
            placeholder="—"
            value={segment.tempo ?? ""}
            onChange={(event) => onChange({ tempo: toNumber(event.target.value) })}
          />
        </Field>

        <Field label="From bar">
          <input
            className="input"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="—"
            value={segment.measureFrom ?? ""}
            onChange={(event) => onChange({ measureFrom: toNumber(event.target.value) })}
          />
        </Field>

        <Field label="To bar">
          <input
            className="input"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="—"
            value={segment.measureTo ?? ""}
            onChange={(event) => onChange({ measureTo: toNumber(event.target.value) })}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Hands">
          <div className="flex flex-wrap gap-1.5">
            {HANDS_OPTIONS.map((hand) => {
              const active = segment.hands === hand;
              return (
                <button
                  key={hand}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ hands: active ? null : hand })}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    active
                      ? "border-tension bg-tension/25 text-white"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  {HANDS_LABELS[hand]}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="How did it go?">
          <Rating value={segment.quality} onChange={(quality) => onChange({ quality })} />
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-tension"
            checked={segment.metronome}
            onChange={(event) => onChange({ metronome: event.target.checked })}
          />
          Practised with a metronome
        </label>
      </div>

      <Field label="Notes" className="mt-4">
        <textarea
          className="input min-h-[68px] resize-y"
          placeholder="What clicked, what to attack next time…"
          value={segment.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          maxLength={2000}
        />
      </Field>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button type="button" onClick={onRemove} className="btn-ghost text-sm text-red-300">
          Remove
        </button>
        <button type="button" onClick={onDone} className="btn-primary text-sm">
          Done
        </button>
      </div>
    </div>
  );
}
