/**
 * The repertoire library: everything you're working on, how much time each
 * piece has had, and how close it is to its target tempo.
 */

import { useEffect, useMemo, useState } from "react";
import TempoLine from "../../components/charts/TempoLine";
import {
  EmptyState,
  ErrorNote,
  Field,
  Modal,
  Segmented,
  Spinner,
} from "../../components/ui";
import {
  createPiece,
  deletePiece,
  getPiece,
  listPieces,
  updatePiece,
  type PiecePayload,
} from "../../api/practice";
import {
  PIECE_KINDS,
  PIECE_KIND_LABELS,
  PIECE_STATUSES,
  PIECE_STATUS_META,
  formatMinutes,
  relativeDay,
} from "../../lib/practice";
import type { Piece, PieceHistoryPoint, PieceKind, PieceStatus } from "../../types";

type Filter = "ACTIVE" | "ALL" | "SHELVED";

const emptyForm: PiecePayload = {
  title: "",
  composer: null,
  kind: "REPERTOIRE",
  status: "LEARNING",
  keySignature: null,
  targetTempo: null,
  notes: null,
};

export default function RepertoirePage() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [filter, setFilter] = useState<Filter>("ACTIVE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Piece | null>(null);
  const [form, setForm] = useState<PiecePayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<{ piece: Piece; history: PieceHistoryPoint[] } | null>(null);

  async function refresh() {
    try {
      setPieces(await listPieces(true));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your repertoire");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const visible = useMemo(() => {
    return pieces.filter((piece) => {
      if (filter === "ALL") return true;
      const shelved = piece.status === "SHELVED" || piece.archived;
      return filter === "SHELVED" ? shelved : !shelved;
    });
  }, [pieces, filter]);

  const grouped = useMemo(() => {
    const groups = new Map<PieceStatus, Piece[]>();
    for (const status of PIECE_STATUSES) {
      const inStatus = visible.filter((piece) => piece.status === status);
      if (inStatus.length) groups.set(status, inStatus);
    }
    return groups;
  }, [visible]);

  function openEditor(piece: Piece | null) {
    setEditing(piece);
    setForm(
      piece
        ? {
            title: piece.title,
            composer: piece.composer,
            kind: piece.kind,
            status: piece.status,
            keySignature: piece.keySignature,
            targetTempo: piece.targetTempo,
            notes: piece.notes,
          }
        : emptyForm,
    );
    setEditorOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError("A piece needs a title.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) await updatePiece(editing.id, form);
      else await createPiece(form);
      setEditorOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this piece");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(piece: Piece) {
    if (
      !window.confirm(
        `Delete "${piece.title}"? Practice you've already logged against it stays in your history, but it will lose the link to this piece.`,
      )
    ) {
      return;
    }
    try {
      await deletePiece(piece.id);
      setEditorOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this piece");
    }
  }

  async function openDetail(piece: Piece) {
    try {
      setDetail(await getPiece(piece.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this piece");
    }
  }

  if (loading) return <Spinner label="Opening the folder…" />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Repertoire</h1>
          <p className="mt-1 text-zinc-400">
            {pieces.length === 0
              ? "The pieces and exercises you're working on."
              : `${pieces.length} ${pieces.length === 1 ? "piece" : "pieces"}, ${formatMinutes(
                  pieces.reduce((sum, piece) => sum + piece.totalMinutes, 0),
                )} logged.`}
          </p>
        </div>
        <button type="button" onClick={() => openEditor(null)} className="btn-primary">
          Add a piece
        </button>
      </header>

      {error && <ErrorNote message={error} />}

      {pieces.length > 0 && (
        <Segmented
          label="Filter repertoire"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "ACTIVE", label: "Active" },
            { value: "SHELVED", label: "Shelved" },
            { value: "ALL", label: "All" },
          ]}
        />
      )}

      {pieces.length === 0 ? (
        <EmptyState
          title="Nothing in the folder yet"
          body="Add the pieces you're learning and every minute you log against them builds a history — time spent, tempo reached, how it's been feeling."
          action={
            <button type="button" onClick={() => openEditor(null)} className="btn-primary">
              Add your first piece
            </button>
          }
        />
      ) : visible.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing here under this filter.</p>
      ) : (
        <div className="space-y-8">
          {[...grouped.entries()].map(([status, group]) => (
            <section key={status}>
              <div className="mb-3 flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PIECE_STATUS_META[status].color }}
                />
                <h2 className="font-display text-base font-semibold">
                  {PIECE_STATUS_META[status].label}
                </h2>
                <span className="text-xs text-zinc-500">{PIECE_STATUS_META[status].blurb}</span>
              </div>
              <ul className="grid gap-3 lg:grid-cols-2">
                {group.map((piece) => (
                  <PieceCard
                    key={piece.id}
                    piece={piece}
                    onOpen={() => openDetail(piece)}
                    onEdit={() => openEditor(piece)}
                    onStatusChange={async (next) => {
                      await updatePiece(piece.id, { status: next });
                      refresh();
                    }}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? "Edit piece" : "Add a piece"}
        footer={
          <>
            {editing && (
              <button
                type="button"
                onClick={() => handleDelete(editing)}
                className="btn-ghost mr-auto text-sm text-red-300"
              >
                Delete
              </button>
            )}
            <button type="button" onClick={() => setEditorOpen(false)} className="btn-ghost">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title">
            <input
              className="input"
              autoFocus
              placeholder="Nocturne in E♭ major, Op. 9 No. 2"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Composer">
              <input
                className="input"
                placeholder="Chopin"
                value={form.composer ?? ""}
                onChange={(event) => setForm({ ...form, composer: event.target.value || null })}
              />
            </Field>
            <Field label="Key">
              <input
                className="input"
                placeholder="E♭ major"
                value={form.keySignature ?? ""}
                onChange={(event) => setForm({ ...form, keySignature: event.target.value || null })}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type">
              <select
                className="input"
                value={form.kind}
                onChange={(event) => setForm({ ...form, kind: event.target.value as PieceKind })}
              >
                {PIECE_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {PIECE_KIND_LABELS[kind]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                className="input"
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as PieceStatus })
                }
              >
                {PIECE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {PIECE_STATUS_META[status].label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Target tempo" hint="The bpm you're aiming to play it at — leave blank if it doesn't apply.">
            <input
              className="input"
              type="number"
              inputMode="numeric"
              min={20}
              max={320}
              placeholder="—"
              value={form.targetTempo ?? ""}
              onChange={(event) =>
                setForm({
                  ...form,
                  targetTempo: event.target.value ? Number(event.target.value) : null,
                })
              }
            />
          </Field>

          <Field label="Notes">
            <textarea
              className="input min-h-[72px] resize-y"
              placeholder="Fingering decisions, tricky spots, edition…"
              value={form.notes ?? ""}
              onChange={(event) => setForm({ ...form, notes: event.target.value || null })}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail?.piece.title ?? ""}
      >
        {detail && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="font-display text-xl font-bold">
                  {formatMinutes(detail.piece.totalMinutes)}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">Total time</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="font-display text-xl font-bold">
                  {detail.piece.bestTempo ? `${detail.piece.bestTempo}` : "—"}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">Best bpm</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="font-display text-xl font-bold">
                  {detail.piece.averageQuality ?? "—"}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">Avg feel</p>
              </div>
            </div>

            <TempoLine history={detail.history} targetTempo={detail.piece.targetTempo} />

            {detail.piece.notes && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-400">Notes</h3>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-zinc-300">
                  {detail.piece.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function PieceCard({
  piece,
  onOpen,
  onEdit,
  onStatusChange,
}: {
  piece: Piece;
  onOpen: () => void;
  onEdit: () => void;
  onStatusChange: (status: PieceStatus) => void;
}) {
  const tempoPercent =
    piece.targetTempo && piece.bestTempo
      ? Math.min(100, Math.round((piece.bestTempo / piece.targetTempo) * 100))
      : null;

  return (
    <li className="card">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <h3 className="truncate font-medium text-zinc-100">{piece.title}</h3>
          <p className="mt-0.5 truncate text-sm text-zinc-500">
            {piece.composer ?? PIECE_KIND_LABELS[piece.kind]}
            {piece.keySignature ? ` · ${piece.keySignature}` : ""}
          </p>
        </button>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${piece.title}`}
          className="shrink-0 rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-zinc-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" />
          </svg>
        </button>
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
        <div className="flex gap-1">
          <dt>Logged</dt>
          <dd className="font-mono text-zinc-300">{formatMinutes(piece.totalMinutes)}</dd>
        </div>
        <div className="flex gap-1">
          <dt>Last</dt>
          <dd className="text-zinc-300">
            {piece.lastPracticed ? relativeDay(piece.lastPracticed) : "never"}
          </dd>
        </div>
        {piece.bestTempo && (
          <div className="flex gap-1">
            <dt>Best</dt>
            <dd className="font-mono text-zinc-300">{piece.bestTempo} bpm</dd>
          </div>
        )}
      </dl>

      {tempoPercent !== null && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-zinc-500">
            <span>Toward {piece.targetTempo} bpm</span>
            <span className="font-mono">{tempoPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-resolve"
              style={{ width: `${tempoPercent}%` }}
            />
          </div>
        </div>
      )}

      <label className="mt-3 block">
        <span className="sr-only">Status for {piece.title}</span>
        <select
          className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-tension/60 focus:outline-none"
          value={piece.status}
          onChange={(event) => onStatusChange(event.target.value as PieceStatus)}
        >
          {PIECE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {PIECE_STATUS_META[status].label}
            </option>
          ))}
        </select>
      </label>
    </li>
  );
}
