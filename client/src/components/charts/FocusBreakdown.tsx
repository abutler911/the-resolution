/**
 * Where the practice time actually went, by focus area.
 *
 * Composition of a whole → a single stacked bar, plus ranked rows underneath
 * that carry the numbers directly. Colours are the fixed per-focus-area hues,
 * so "repertoire" is the same colour here as everywhere else in the app, and
 * every row is labelled in text — the colour is a cross-reference, not the
 * only way to tell the categories apart.
 */

import { FOCUS_META, formatMinutes } from "../../lib/practice";
import type { FocusArea } from "../../types";
import { ChartFrame, ChartTable, TooltipBody, useElementWidth, useTooltip } from "./chartBits";

const BAR_HEIGHT = 26;
const GAP = 2;

export default function FocusBreakdown({
  data,
  subtitle,
}: {
  data: Array<{ focusArea: FocusArea; minutes: number; segments: number }>;
  subtitle?: string;
}) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const { tooltip, setTooltip, clear } = useTooltip();

  const total = data.reduce((sum, entry) => sum + entry.minutes, 0);

  if (total === 0) {
    return (
      <section className="card">
        <h3 className="font-display text-base font-semibold">Where the time goes</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Log a session and your practice breaks down by focus area here.
        </p>
      </section>
    );
  }

  // Lay the segments out left to right, leaving a 2px surface gap between
  // neighbours so adjacent colours never bleed into one another.
  let cursor = 0;
  const segments = data.map((entry) => {
    const segmentWidth = (entry.minutes / total) * width;
    const x = cursor;
    cursor += segmentWidth;
    return { ...entry, x, width: Math.max(0, segmentWidth - GAP) };
  });

  return (
    <ChartFrame
      title="Where the time goes"
      subtitle={subtitle}
      containerRef={containerRef}
      tooltip={tooltip}
      table={
        <ChartTable
          headers={["Focus", "Minutes", "Share"]}
          rows={data.map((entry) => [
            FOCUS_META[entry.focusArea].label,
            entry.minutes,
            `${Math.round((entry.minutes / total) * 100)}%`,
          ])}
        />
      }
    >
      <svg
        width={width}
        height={BAR_HEIGHT}
        role="img"
        aria-label={`Practice split by focus area across ${formatMinutes(total)}.`}
        onMouseLeave={clear}
      >
        {segments.map((segment) => (
          <rect
            key={segment.focusArea}
            x={segment.x}
            y={0}
            width={segment.width}
            height={BAR_HEIGHT}
            rx={4}
            fill={FOCUS_META[segment.focusArea].color}
            onMouseEnter={() =>
              setTooltip({
                x: segment.x + segment.width / 2,
                y: 0,
                content: (
                  <TooltipBody
                    title={FOCUS_META[segment.focusArea].label}
                    rows={[
                      {
                        label: "Practised",
                        value: formatMinutes(segment.minutes),
                        color: FOCUS_META[segment.focusArea].color,
                      },
                      {
                        label: "Share",
                        value: `${Math.round((segment.minutes / total) * 100)}%`,
                      },
                    ]}
                  />
                ),
              })
            }
          />
        ))}
      </svg>

      <ul className="mt-4 space-y-2.5">
        {data.map((entry) => {
          const percent = Math.round((entry.minutes / total) * 100);
          return (
            <li key={entry.focusArea} className="flex items-center gap-3 text-sm">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: FOCUS_META[entry.focusArea].color }}
              />
              <span className="min-w-0 flex-1 truncate text-zinc-200">
                {FOCUS_META[entry.focusArea].label}
              </span>
              <span className="font-mono text-xs text-zinc-400">
                {formatMinutes(entry.minutes)}
              </span>
              <span className="w-9 text-right font-mono text-xs text-zinc-500">{percent}%</span>
            </li>
          );
        })}
      </ul>
    </ChartFrame>
  );
}
