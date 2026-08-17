/**
 * Tempo progression for one piece: the best BPM reached on each day it was
 * worked on, with the target tempo as a reference line.
 *
 * A single series, so no legend box — the title names it. 2px line, markers
 * big enough to hit, and a 2px surface ring on each marker so points that land
 * on top of the line still read as points.
 */

import { formatDay } from "../../lib/practice";
import type { PieceHistoryPoint } from "../../types";
import {
  CHART,
  ChartFrame,
  ChartTable,
  TooltipBody,
  useElementWidth,
  useTooltip,
} from "./chartBits";

const HEIGHT = 210;
const PAD = { top: 20, right: 14, bottom: 26, left: 38 };
const LINE = "#f59e0b";

export default function TempoLine({
  history,
  targetTempo,
}: {
  history: PieceHistoryPoint[];
  targetTempo: number | null;
}) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const { tooltip, setTooltip, clear } = useTooltip();

  const points = history.filter(
    (point): point is PieceHistoryPoint & { bestTempo: number } => point.bestTempo != null,
  );

  if (points.length === 0) {
    return (
      <section className="card">
        <h3 className="font-display text-base font-semibold">Tempo progression</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Log a working tempo on this piece and the climb toward your target
          shows up here.
        </p>
      </section>
    );
  }

  const plotWidth = Math.max(120, width - PAD.left - PAD.right);
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;

  const tempi = points.map((p) => p.bestTempo);
  const rawMin = Math.min(...tempi, targetTempo ?? Infinity);
  const rawMax = Math.max(...tempi, targetTempo ?? 0);
  // Breathe a little so the line isn't glued to the frame, and never invert.
  const min = Math.max(0, Math.floor((rawMin - 10) / 10) * 10);
  const max = Math.ceil((rawMax + 10) / 10) * 10;
  const span = Math.max(1, max - min);

  const x = (index: number) =>
    PAD.left + (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth);
  const y = (tempo: number) => PAD.top + plotHeight - ((tempo - min) / span) * plotHeight;

  const path = points.map((point, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(point.bestTempo)}`).join(" ");
  const ticks = [min, min + span / 2, max];
  const latest = points[points.length - 1]!;

  return (
    <ChartFrame
      title="Tempo progression"
      subtitle={
        targetTempo
          ? `Best each day — the dashed line is your ${targetTempo} bpm target`
          : "Best tempo reached each day you practised it"
      }
      containerRef={containerRef}
      tooltip={tooltip}
      table={
        <ChartTable
          headers={["Day", "Best tempo", "Minutes"]}
          rows={points
            .slice()
            .reverse()
            .map((point) => [formatDay(point.date), `${point.bestTempo} bpm`, point.minutes])}
        />
      }
    >
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={`Tempo progression: from ${points[0]!.bestTempo} to ${latest.bestTempo} bpm${targetTempo ? `, target ${targetTempo} bpm` : ""}.`}
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
            <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" fontSize={10} fill={CHART.textMuted}>
              {Math.round(tick)}
            </text>
          </g>
        ))}

        {/* Named in the subtitle rather than labelled inline, which would
            collide with the latest-point label on a narrow chart. */}
        {targetTempo ? (
          <line
            x1={PAD.left}
            x2={width - PAD.right}
            y1={y(targetTempo)}
            y2={y(targetTempo)}
            stroke="#a5b4fc"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        ) : null}

        <path d={path} fill="none" stroke={LINE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((point, index) => (
          <g key={point.date}>
            <circle
              cx={x(index)}
              cy={y(point.bestTempo)}
              r={4.5}
              fill={LINE}
              stroke={CHART.surface}
              strokeWidth={2}
              pointerEvents="none"
            />
            <circle
              cx={x(index)}
              cy={y(point.bestTempo)}
              r={14}
              fill="transparent"
              onMouseEnter={() =>
                setTooltip({
                  x: x(index),
                  y: y(point.bestTempo),
                  content: (
                    <TooltipBody
                      title={formatDay(point.date)}
                      rows={[
                        { label: "Best tempo", value: `${point.bestTempo} bpm`, color: LINE },
                        { label: "Practised", value: `${point.minutes}m` },
                      ]}
                    />
                  ),
                })
              }
            />
          </g>
        ))}

        {/* Direct-label just the latest point — the number that matters today. */}
        <text
          x={x(points.length - 1)}
          y={y(latest.bestTempo) - 12}
          textAnchor="end"
          fontSize={11}
          fill="#fcd34d"
          pointerEvents="none"
        >
          {latest.bestTempo} bpm
        </text>

        <line
          x1={PAD.left}
          x2={width - PAD.right}
          y1={PAD.top + plotHeight}
          y2={PAD.top + plotHeight}
          stroke={CHART.axis}
        />
        <text x={PAD.left} y={HEIGHT - 8} fontSize={10} fill={CHART.textMuted}>
          {formatDay(points[0]!.date)}
        </text>
        {points.length > 1 && (
          <text x={width - PAD.right} y={HEIGHT - 8} textAnchor="end" fontSize={10} fill={CHART.textMuted}>
            {formatDay(latest.date)}
          </text>
        )}
      </svg>
    </ChartFrame>
  );
}
