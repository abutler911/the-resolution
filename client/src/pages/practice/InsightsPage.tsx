/**
 * Insights: the long view. Are the hours going where you think they are, is
 * the habit holding, and which pieces are actually getting the time?
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FocusBreakdown from "../../components/charts/FocusBreakdown";
import MinutesBars, { type BarPoint } from "../../components/charts/MinutesBars";
import PracticeHeatmap from "../../components/charts/PracticeHeatmap";
import { EmptyState, Segmented, Spinner, StatTile } from "../../components/ui";
import { getInsights } from "../../api/practice";
import { formatDay, formatMinutes, parseDayKey, relativeDay } from "../../lib/practice";
import type { Insights } from "../../types";

type Range = "30" | "90" | "365";

const RANGE_LABELS: Record<Range, string> = {
  "30": "30 days",
  "90": "3 months",
  "365": "A year",
};

export default function InsightsPage() {
  const [range, setRange] = useState<Range>("90");
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getInsights(Number(range))
      .then((data) => {
        if (!cancelled) setInsights(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load insights");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  if (loading && !insights) return <Spinner label="Crunching the numbers…" />;
  if (error) return <p className="text-sm text-red-300">{error}</p>;
  if (!insights) return null;

  if (insights.allTime.sessions === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Insights</h1>
        <EmptyState
          title="Nothing to chart yet"
          body="Log a few sessions and this page fills up: where your time goes, how the habit is holding, and which pieces are getting the hours."
          action={
            <Link to="/practice/log" className="btn-primary">
              Log a session
            </Link>
          }
        />
      </div>
    );
  }

  // Long ranges get rolled up to weeks — 365 daily bars is a picket fence.
  const useWeekly = Number(range) > 60;
  const bars: BarPoint[] = useWeekly
    ? insights.weekly.map((week) => ({
        key: week.weekStart,
        fullLabel: `Week of ${formatDay(week.weekStart)}`,
        value: week.minutes,
      }))
    : insights.daily.map((day) => ({
        key: day.date,
        fullLabel: relativeDay(day.date),
        value: day.minutes,
      }));

  // Label roughly six ticks, whatever the bucket count.
  const tickEvery = Math.max(1, Math.ceil(bars.length / 6));
  const labelled = bars.map((bar, index) => ({
    ...bar,
    label:
      index % tickEvery === 0
        ? parseDayKey(bar.key).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        : undefined,
  }));

  const consistency = Math.round((insights.totals.daysPractised / insights.range.days) * 100);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Insights</h1>
          <p className="mt-1 text-zinc-400">
            {formatMinutes(insights.allTime.minutes)} logged since{" "}
            {insights.allTime.firstSession ? formatDay(insights.allTime.firstSession) : "day one"}.
          </p>
        </div>
        <Segmented
          label="Time range"
          value={range}
          onChange={setRange}
          options={(Object.keys(RANGE_LABELS) as Range[]).map((value) => ({
            value,
            label: RANGE_LABELS[value],
          }))}
        />
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          label="Time practised"
          value={formatMinutes(insights.totals.minutes)}
          caption={`Across ${insights.totals.sessions} sessions`}
          accent
        />
        <StatTile
          label="Consistency"
          value={consistency}
          unit="%"
          caption={`${insights.totals.daysPractised} of ${insights.range.days} days`}
        />
        <StatTile
          label="Streak"
          value={insights.streak.current}
          unit={insights.streak.current === 1 ? "day" : "days"}
          caption={`Longest ${insights.streak.longest}`}
        />
        <StatTile
          label="Avg session"
          value={insights.totals.averageSessionMinutes}
          unit="min"
          caption={
            insights.totals.averageQuality != null
              ? `Feels like ${insights.totals.averageQuality}/5`
              : "Rate your segments to track feel"
          }
        />
      </div>

      <MinutesBars
        title={useWeekly ? "Minutes per week" : "Minutes per day"}
        subtitle={`Last ${RANGE_LABELS[range].toLowerCase()}`}
        points={labelled}
      />

      <PracticeHeatmap days={insights.daily} />

      <FocusBreakdown
        data={insights.byFocus}
        subtitle={`${formatMinutes(insights.totals.minutes)} split across focus areas`}
      />

      {insights.byPiece.length > 0 && (
        <section className="card">
          <h3 className="font-display text-base font-semibold">Most-practised pieces</h3>
          <p className="mt-0.5 text-sm text-zinc-400">
            Where the repertoire time went over the last{" "}
            {RANGE_LABELS[range].toLowerCase()}
          </p>
          <ul className="mt-4 space-y-3">
            {insights.byPiece.map((piece) => {
              const share = Math.round((piece.minutes / insights.byPiece[0]!.minutes) * 100);
              return (
                <li key={piece.pieceId}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">
                      <span className="font-medium text-zinc-100">{piece.title}</span>
                      {piece.composer && (
                        <span className="ml-2 text-xs text-zinc-500">{piece.composer}</span>
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-zinc-400">
                      {formatMinutes(piece.minutes)}
                      {piece.bestTempo ? ` · ${piece.bestTempo} bpm` : ""}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-tension"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {insights.totals.metronomeShare > 0 && (
        <p className="text-center text-sm text-zinc-500">
          {insights.totals.metronomeShare}% of your practice time over the last{" "}
          {RANGE_LABELS[range].toLowerCase()} was with a metronome.
        </p>
      )}
    </div>
  );
}
