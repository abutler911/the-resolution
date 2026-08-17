/**
 * Minutes practised over time — the workhorse chart.
 *
 * One series, so no legend: the title names it. Bars are thin with rounded
 * tops anchored to the baseline, a 2px surface gap keeps neighbours from
 * fusing into a block, and only the peak gets a direct label so the eye has
 * one number to hold onto rather than forty.
 */

import { formatMinutes } from "../../lib/practice";
import {
  CHART,
  ChartFrame,
  ChartTable,
  TooltipBody,
  niceMax,
  useElementWidth,
  useTooltip,
} from "./chartBits";

export interface BarPoint {
  key: string;
  /** Axis tick text; omit to leave the slot blank. */
  label?: string;
  /** Long form used in the tooltip. */
  fullLabel: string;
  value: number;
}

const HEIGHT = 200;
const PAD = { top: 18, right: 8, bottom: 24, left: 34 };
const BAR_GAP = 2;
// Thin marks read as data; a wide slab reads as a block of colour.
const MAX_BAR_WIDTH = 26;

export default function MinutesBars({
  title,
  subtitle,
  points,
  targetMinutes,
}: {
  title: string;
  subtitle?: string;
  points: BarPoint[];
  /** Optional daily target, drawn as a reference line. */
  targetMinutes?: number | null;
}) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const { tooltip, setTooltip, clear } = useTooltip();

  const plotWidth = Math.max(120, width - PAD.left - PAD.right);
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const peak = Math.max(...points.map((p) => p.value), 0);
  const max = niceMax(Math.max(peak, targetMinutes ?? 0));
  const slot = points.length > 0 ? plotWidth / points.length : plotWidth;
  const barWidth = Math.max(2, Math.min(MAX_BAR_WIDTH, slot - BAR_GAP));
  // Centre the bar in its slot once the cap kicks in.
  const barOffset = (slot - barWidth) / 2;
  const y = (value: number) => PAD.top + plotHeight - (value / max) * plotHeight;
  const peakIndex = points.findIndex((p) => p.value === peak && peak > 0);

  const ticks = [0, max / 2, max];
  const total = points.reduce((sum, point) => sum + point.value, 0);

  return (
    <ChartFrame
      title={title}
      subtitle={
        targetMinutes
          ? `${subtitle ? `${subtitle} · ` : ""}dashed line is your ${targetMinutes}m goal`
          : subtitle
      }
      containerRef={containerRef}
      tooltip={tooltip}
      table={
        <ChartTable
          headers={["Period", "Minutes"]}
          rows={points.map((point) => [point.fullLabel, point.value])}
        />
      }
    >
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={`${title}. ${formatMinutes(total)} across ${points.length} periods, peaking at ${formatMinutes(peak)}.`}
        onMouseLeave={clear}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke={CHART.grid}
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y(tick) + 4}
              textAnchor="end"
              fontSize={10}
              fill={CHART.textMuted}
            >
              {Math.round(tick)}
            </text>
          </g>
        ))}

        {/* The goal is named in the subtitle, so the line needs no label of its
            own — on a narrow chart any inline text collides with the bars. */}
        {targetMinutes ? (
          <line
            x1={PAD.left}
            x2={width - PAD.right}
            y1={y(targetMinutes)}
            y2={y(targetMinutes)}
            stroke="#a5b4fc"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        ) : null}

        {points.map((point, index) => {
          const x = PAD.left + index * slot + barOffset;
          const height = point.value > 0 ? Math.max(3, PAD.top + plotHeight - y(point.value)) : 0;
          const isPeak = index === peakIndex;

          return (
            <g key={point.key}>
              {/* Full-height hit target: hovering a 4px bar is a fiddle. */}
              <rect
                x={PAD.left + index * slot}
                y={PAD.top}
                width={slot}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() =>
                  setTooltip({
                    x: PAD.left + index * slot + slot / 2,
                    y: point.value > 0 ? y(point.value) : PAD.top + plotHeight,
                    content: (
                      <TooltipBody
                        title={point.fullLabel}
                        rows={[
                          {
                            label: "Practised",
                            value: point.value > 0 ? formatMinutes(point.value) : "—",
                          },
                        ]}
                      />
                    ),
                  })
                }
              />
              {height > 0 && (
                <rect
                  x={x}
                  y={y(point.value)}
                  width={barWidth}
                  height={height}
                  rx={Math.min(4, barWidth / 2)}
                  fill={isPeak ? "#a5b4fc" : "#6366f1"}
                  pointerEvents="none"
                />
              )}
              {isPeak && barWidth > 6 && (
                <text
                  x={x + barWidth / 2}
                  y={y(point.value) - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#c7d2fe"
                  pointerEvents="none"
                >
                  {point.value}
                </text>
              )}
            </g>
          );
        })}

        <line
          x1={PAD.left}
          x2={width - PAD.right}
          y1={PAD.top + plotHeight}
          y2={PAD.top + plotHeight}
          stroke={CHART.axis}
          strokeWidth={1}
        />

        {points.map((point, index) =>
          point.label ? (
            <text
              key={`${point.key}-label`}
              x={PAD.left + index * slot + slot / 2}
              y={HEIGHT - 7}
              textAnchor="middle"
              fontSize={10}
              fill={CHART.textMuted}
            >
              {point.label}
            </text>
          ) : null,
        )}
      </svg>
    </ChartFrame>
  );
}
