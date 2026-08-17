/**
 * A year of practice at a glance: one cell per day, weeks running left to right.
 *
 * Magnitude, so the colour is sequential — a single indigo hue stepping from
 * near-surface (didn't practise) to bright (a long session). One hue only; a
 * rainbow here would imply categories that don't exist.
 */

import { formatDay, formatMinutes, parseDayKey } from "../../lib/practice";
import type { DayPoint } from "../../types";
import {
  CHART,
  ChartFrame,
  ChartTable,
  TooltipBody,
  useElementWidth,
  useTooltip,
} from "./chartBits";

// Empty first, then one hue light→dark reversed for a dark surface: the more
// minutes, the further the cell lifts off the background.
const RAMP = ["rgba(255,255,255,0.05)", "#312e81", "#4338ca", "#6366f1", "#a5b4fc"] as const;

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];
const GAP = 3;
const LABEL_WIDTH = 30;
const HEADER = 16;

/** Bucket a day's minutes onto the ramp. Thresholds scale with the player's own typical day. */
function stepFor(minutes: number, busy: number): number {
  if (minutes <= 0) return 0;
  if (minutes < busy * 0.34) return 1;
  if (minutes < busy * 0.67) return 2;
  if (minutes < busy) return 3;
  return 4;
}

export default function PracticeHeatmap({ days }: { days: DayPoint[] }) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const { tooltip, setTooltip, clear } = useTooltip();

  if (days.length === 0) return null;

  // Pad the front of the range so the first column starts on a Monday.
  const firstDate = parseDayKey(days[0]!.date);
  const leadingBlanks = (firstDate.getDay() + 6) % 7;
  const cells: Array<DayPoint | null> = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...days,
  ];
  const weeks = Math.ceil(cells.length / 7);

  const available = Math.max(120, width - LABEL_WIDTH);
  // Cells grow to fill a short range and shrink for a full year, within limits
  // that keep them tappable at one end and legible at the other.
  const cell = Math.max(6, Math.min(28, Math.floor(available / weeks) - GAP));
  const step = cell + GAP;
  const height = HEADER + 7 * step;
  const originX = LABEL_WIDTH;

  const practised = days.filter((day) => day.minutes > 0);
  // "A busy day" = the 75th-percentile practice day, so the scale means
  // something for a 20-minute player and a three-hour player alike.
  const sorted = practised.map((d) => d.minutes).sort((a, b) => a - b);
  const busy = sorted.length ? sorted[Math.floor(sorted.length * 0.75)]! : 60;

  const totalMinutes = days.reduce((sum, day) => sum + day.minutes, 0);

  // Month tick wherever a column's first day falls in a new month, skipping any
  // that would collide with the tick before it.
  const monthTicks: Array<{ week: number; label: string }> = [];
  let lastMonth = -1;
  let lastTickWeek = -99;
  cells.forEach((day, index) => {
    if (!day || index % 7 !== 0) return;
    const date = parseDayKey(day.date);
    if (date.getMonth() === lastMonth) return;

    lastMonth = date.getMonth();
    const week = Math.floor(index / 7);
    const minGap = Math.ceil(26 / step);
    if (week - lastTickWeek < minGap) return;

    lastTickWeek = week;
    monthTicks.push({
      week,
      label: date.toLocaleDateString(undefined, { month: "short" }),
    });
  });

  return (
    <ChartFrame
      title="Practice calendar"
      subtitle={`${practised.length} of the last ${days.length} days at the piano`}
      containerRef={containerRef}
      tooltip={tooltip}
      legend={
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>Less</span>
          {RAMP.map((color, index) => (
            <span
              key={color}
              aria-hidden
              className="h-3 w-3 rounded-[3px]"
              style={{ backgroundColor: color }}
              title={index === 0 ? "No practice" : undefined}
            />
          ))}
          <span>More</span>
        </div>
      }
      table={
        <ChartTable
          headers={["Day", "Minutes", "Sessions"]}
          rows={practised
            .slice()
            .reverse()
            .map((day) => [formatDay(day.date), day.minutes, day.sessions])}
        />
      }
    >
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={`Practice calendar: ${practised.length} days practised out of ${days.length}, ${formatMinutes(totalMinutes)} in total.`}
        onMouseLeave={clear}
      >
        {monthTicks.map((tick) => (
          <text
            key={`${tick.label}-${tick.week}`}
            x={originX + tick.week * step}
            y={11}
            fontSize={10}
            fill={CHART.textMuted}
          >
            {tick.label}
          </text>
        ))}

        {DAY_LABELS.map((label, row) =>
          label ? (
            <text
              key={label}
              x={originX - 8}
              y={HEADER + row * step + cell - 2}
              textAnchor="end"
              fontSize={10}
              fill={CHART.textMuted}
            >
              {label}
            </text>
          ) : null,
        )}

        {cells.map((day, index) => {
          if (!day) return null;
          const week = Math.floor(index / 7);
          const row = index % 7;
          const x = originX + week * step;
          const y = HEADER + row * step;

          return (
            <rect
              key={day.date}
              x={x}
              y={y}
              width={cell}
              height={cell}
              rx={2.5}
              fill={RAMP[stepFor(day.minutes, busy)]}
              onMouseEnter={() =>
                setTooltip({
                  x: x + cell / 2,
                  y,
                  content: (
                    <TooltipBody
                      title={formatDay(day.date)}
                      rows={[
                        {
                          label: "Practised",
                          value: day.minutes > 0 ? formatMinutes(day.minutes) : "Rest day",
                        },
                        ...(day.sessions > 1
                          ? [{ label: "Sessions", value: String(day.sessions) }]
                          : []),
                      ]}
                    />
                  ),
                })
              }
            />
          );
        })}
      </svg>
    </ChartFrame>
  );
}
