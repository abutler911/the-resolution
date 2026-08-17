/**
 * Goals: what you're aiming at, and how far along you are.
 *
 * A goal is three choices — what to count, over what window, and how much —
 * with an optional narrowing to a focus area or a single piece. The form leads
 * with a few presets because most goals are one of a handful of shapes.
 */

import { useEffect, useMemo, useState } from "react";
import GoalCard from "../../components/GoalCard";
import { EmptyState, ErrorNote, Field, Modal, Spinner } from "../../components/ui";
import {
  createGoal,
  deleteGoal,
  listGoals,
  listPieces,
  updateGoal,
  type GoalPayload,
} from "../../api/practice";
import {
  FOCUS_AREAS,
  FOCUS_META,
  GOAL_METRIC_LABELS,
  GOAL_PERIOD_LABELS,
  goalUnit,
} from "../../lib/practice";
import type { FocusArea, Goal, GoalMetric, GoalPeriod, Piece } from "../../types";

const METRICS: GoalMetric[] = ["MINUTES", "SESSIONS", "DAYS", "TEMPO"];
const PERIODS: GoalPeriod[] = ["DAILY", "WEEKLY", "MONTHLY", "TOTAL"];

interface Preset {
  label: string;
  blurb: string;
  values: Partial<GoalPayload>;
}

const PRESETS: Preset[] = [
  {
    label: "30 minutes a day",
    blurb: "The habit goal",
    values: { title: "Practise 30 minutes a day", metric: "MINUTES", period: "DAILY", target: 30 },
  },
  {
    label: "5 days a week",
    blurb: "Consistency over volume",
    values: { title: "Practise 5 days a week", metric: "DAYS", period: "WEEKLY", target: 5 },
  },
  {
    label: "Scales, 60 min a week",
    blurb: "Protect the technique time",
    values: {
      title: "An hour of scales a week",
      metric: "MINUTES",
      period: "WEEKLY",
      target: 60,
      focusArea: "SCALES",
    },
  },
  {
    label: "Get a piece up to tempo",
    blurb: "Pick the piece and the bpm",
    values: { title: "", metric: "TEMPO", period: "TOTAL", target: 120 },
  },
];

const emptyForm: GoalPayload = {
  title: "",
  metric: "MINUTES",
  period: "WEEKLY",
  target: 150,
  focusArea: null,
  pieceId: null,
  endDate: null,
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GoalPayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    try {
      const [loadedGoals, loadedPieces] = await Promise.all([listGoals(true), listPieces()]);
      setGoals(loadedGoals);
      setPieces(loadedPieces);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your goals");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const active = useMemo(() => goals.filter((goal) => !goal.archived), [goals]);
  const archived = useMemo(() => goals.filter((goal) => goal.archived), [goals]);

  async function handleCreate() {
    const title = form.title.trim();
    if (!title) {
      setError("Give the goal a name you'll recognise.");
      return;
    }
    if (form.metric === "TEMPO" && !form.pieceId) {
      setError("A tempo goal needs a piece to measure it against.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      setGoals(
        await createGoal({
          ...form,
          title,
          // Tempo is inherently cumulative — there's no "per week" best.
          period: form.metric === "TEMPO" ? "TOTAL" : form.period,
        }),
      );
      setOpen(false);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this goal");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(goal: Goal) {
    try {
      setGoals(await updateGoal(goal.id, { archived: !goal.archived }));
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update this goal");
    }
  }

  async function handleDelete(goal: Goal) {
    if (!window.confirm(`Delete "${goal.title}"?`)) return;
    try {
      await deleteGoal(goal.id);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this goal");
    }
  }

  if (loading) return <Spinner label="Checking your goals…" />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Goals</h1>
          <p className="mt-1 text-zinc-400">
            {active.length === 0
              ? "Decide what you're aiming at."
              : `${active.filter((goal) => goal.met).length} of ${active.length} met right now.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(emptyForm);
            setOpen(true);
          }}
          className="btn-primary"
        >
          New goal
        </button>
      </header>

      {error && <ErrorNote message={error} />}

      {active.length === 0 ? (
        <EmptyState
          title="No goals set"
          body="Goals give the practice log something to push against — minutes a day, days a week, an hour of scales, or a tempo to reach on a piece."
          action={
            <button type="button" onClick={() => setOpen(true)} className="btn-primary">
              Set a goal
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          {active.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onArchive={() => handleArchive(goal)}
              onDelete={() => handleDelete(goal)}
            />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setShowArchived((value) => !value)}
            className="text-sm text-zinc-400 hover:text-zinc-100"
            aria-expanded={showArchived}
          >
            {showArchived ? "Hide" : "Show"} archived ({archived.length})
          </button>
          {showArchived && (
            <div className="mt-3 grid gap-3 opacity-70 lg:grid-cols-2">
              {archived.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onArchive={() => handleArchive(goal)}
                  onDelete={() => handleDelete(goal)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New goal"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              Cancel
            </button>
            <button type="button" onClick={handleCreate} disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Set goal"}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Start from
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setForm({ ...emptyForm, ...preset.values })}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-tension/50 hover:bg-white/10"
                >
                  <span className="block text-sm font-medium text-zinc-100">{preset.label}</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">{preset.blurb}</span>
                </button>
              ))}
            </div>
          </div>

          <Field label="Goal name">
            <input
              className="input"
              placeholder="Practise 30 minutes a day"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Count">
              <select
                className="input"
                value={form.metric}
                onChange={(event) => {
                  const metric = event.target.value as GoalMetric;
                  setForm({
                    ...form,
                    metric,
                    period: metric === "TEMPO" ? "TOTAL" : form.period,
                  });
                }}
              >
                {METRICS.map((metric) => (
                  <option key={metric} value={metric}>
                    {GOAL_METRIC_LABELS[metric]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Window">
              <select
                className="input"
                value={form.period}
                disabled={form.metric === "TEMPO"}
                onChange={(event) =>
                  setForm({ ...form, period: event.target.value as GoalPeriod })
                }
              >
                {PERIODS.map((period) => (
                  <option key={period} value={period}>
                    {GOAL_PERIOD_LABELS[period]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label={`Target (${goalUnit(form.metric)})`}>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              min={1}
              value={form.target}
              onChange={(event) => setForm({ ...form, target: Number(event.target.value) || 1 })}
            />
          </Field>

          {form.metric === "TEMPO" ? (
            <Field label="Piece">
              <select
                className="input"
                value={form.pieceId ?? ""}
                onChange={(event) => setForm({ ...form, pieceId: event.target.value || null })}
              >
                <option value="">— choose a piece —</option>
                {pieces.map((piece) => (
                  <option key={piece.id} value={piece.id}>
                    {piece.title}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field
              label="Only count"
              hint="Leave on everything to count all practice toward this goal."
            >
              <select
                className="input"
                value={form.focusArea ?? ""}
                onChange={(event) =>
                  setForm({ ...form, focusArea: (event.target.value || null) as FocusArea | null })
                }
              >
                <option value="">Everything</option>
                {FOCUS_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {FOCUS_META[area].label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {form.period === "TOTAL" && (
            <Field label="Deadline" hint="Optional — for a recital or an exam date.">
              <input
                className="input"
                type="date"
                value={form.endDate ?? ""}
                onChange={(event) => setForm({ ...form, endDate: event.target.value || null })}
              />
            </Field>
          )}
        </div>
      </Modal>
    </div>
  );
}
