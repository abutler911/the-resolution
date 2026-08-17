/**
 * One goal, with a progress ring.
 *
 * The ring is a single-value gauge, so the number it stands for is always
 * printed inside it — the arc is the glance, the text is the answer.
 */

import {
  FOCUS_META,
  GOAL_PERIOD_LABELS,
  formatMinutes,
  goalUnit,
} from "../lib/practice";
import type { Goal } from "../types";

const SIZE = 84;
const STROKE = 7;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function progressColor(goal: Goal): string {
  if (goal.met) return "#f59e0b";
  return "#6366f1";
}

function describeScope(goal: Goal): string {
  if (goal.pieceTitle) return goal.pieceTitle;
  if (goal.focusArea) return FOCUS_META[goal.focusArea].label;
  return "All practice";
}

/**
 * "56m of 45m", "1 of 6 days", "110 of 120 bpm" — the unit is written once, at
 * the end, so the pair reads as a sentence rather than a pair of labels.
 */
function formatProgress(goal: Goal): string {
  if (goal.metric === "MINUTES") {
    return `${formatMinutes(goal.current)} of ${formatMinutes(goal.target)}`;
  }
  return `${goal.current} of ${goal.target} ${goalUnit(goal.metric)}`;
}

export default function GoalCard({
  goal,
  onArchive,
  onDelete,
}: {
  goal: Goal;
  onArchive?: () => void;
  onDelete?: () => void;
}) {
  const dash = (goal.percent / 100) * CIRCUMFERENCE;
  const color = progressColor(goal);

  return (
    <div className="card flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          role="img"
          aria-label={`${goal.title}: ${formatProgress(goal)}, ${goal.percent}%.`}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-display text-lg font-bold">
          {goal.percent}%
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-medium text-zinc-100">{goal.title}</h3>
          {goal.met && (
            <span className="shrink-0 rounded-full bg-resolve/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-resolve">
              Met
            </span>
          )}
        </div>

        <p className="mt-1 font-mono text-sm text-zinc-300">{formatProgress(goal)}</p>

        <p className="mt-1 text-xs text-zinc-500">
          {GOAL_PERIOD_LABELS[goal.period]} · {describeScope(goal)}
          {goal.period !== "TOTAL" &&
            ` · ${goal.daysRemaining} ${goal.daysRemaining === 1 ? "day" : "days"} left`}
        </p>

        {(onArchive || onDelete) && (
          <div className="mt-2.5 flex gap-3 text-xs">
            {onArchive && (
              <button type="button" onClick={onArchive} className="text-zinc-400 hover:text-zinc-100">
                {goal.archived ? "Restore" : "Archive"}
              </button>
            )}
            {onDelete && (
              <button type="button" onClick={onDelete} className="text-zinc-500 hover:text-red-300">
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
