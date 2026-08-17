/**
 * The practice home screen: did I practise today, how's the week going, what
 * are my goals sitting at, and what's gone quiet in the repertoire.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GoalCard from "../../components/GoalCard";
import MinutesBars, { type BarPoint } from "../../components/charts/MinutesBars";
import { EmptyState, SectionHeading, Spinner, StatTile } from "../../components/ui";
import { getInsights, listGoals, listPieces, listSessions } from "../../api/practice";
import { useAuth } from "../../context/AuthContext";
import {
  FOCUS_META,
  formatMinutes,
  parseDayKey,
  relativeDay,
  segmentTitle,
} from "../../lib/practice";
import type { Goal, Insights, Piece, PracticeSession } from "../../types";

/** Pieces in active work that haven't been touched in a fortnight. */
function goingStale(pieces: Piece[]): Piece[] {
  const cutoff = Date.now() - 14 * 86_400_000;
  return pieces
    .filter(
      (piece) =>
        !piece.archived &&
        (piece.status === "LEARNING" ||
          piece.status === "POLISHING" ||
          piece.status === "PERFORMANCE_READY"),
    )
    .filter((piece) => !piece.lastPracticed || parseDayKey(piece.lastPracticed).getTime() < cutoff)
    .sort((a, b) => (a.lastPracticed ?? "").localeCompare(b.lastPracticed ?? ""))
    .slice(0, 4);
}

export default function PracticeDashboard() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insights | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getInsights(28), listGoals(), listPieces(), listSessions({ limit: 5 })])
      .then(([loadedInsights, loadedGoals, loadedPieces, loadedSessions]) => {
        if (cancelled) return;
        setInsights(loadedInsights);
        setGoals(loadedGoals);
        setPieces(loadedPieces);
        setSessions(loadedSessions);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load practice data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Spinner label="Warming up…" />;
  if (error) return <p className="text-sm text-red-300">{error}</p>;
  if (!insights) return null;

  const todayKey = insights.range.to;
  const today = insights.daily.find((day) => day.date === todayKey);
  const todayMinutes = today?.minutes ?? 0;
  const stale = goingStale(pieces);
  const hasHistory = insights.allTime.sessions > 0;

  const last14: BarPoint[] = insights.daily.slice(-14).map((day) => ({
    key: day.date,
    label: parseDayKey(day.date).toLocaleDateString(undefined, { weekday: "narrow" }),
    fullLabel: relativeDay(day.date),
    value: day.minutes,
  }));

  const weekDelta = insights.thisWeek.minutes - insights.lastWeek.minutes;
  const dailyGoal = goals.find((goal) => goal.period === "DAILY" && goal.metric === "MINUTES");

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            {user ? `Hey ${user.displayName}` : "Practice"}
          </h1>
          <p className="mt-1 text-zinc-400">
            {todayMinutes > 0
              ? `${formatMinutes(todayMinutes)} at the piano today. Nice.`
              : hasHistory
                ? "Nothing logged today yet."
                : "Let's get the first session on the board."}
          </p>
        </div>
        <Link to="/practice/log" className="btn-primary px-5 py-3">
          {todayMinutes > 0 ? "Log more practice" : "Start practising"}
        </Link>
      </header>

      {!hasHistory ? (
        <EmptyState
          title="Your practice log starts here"
          body="Log what you work on — the piece, the tempo, the bars, how it felt — and this page turns into the story of how you're improving."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/practice/log" className="btn-primary">
                Log your first session
              </Link>
              <Link to="/practice/repertoire" className="btn-ghost">
                Add a piece
              </Link>
            </div>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatTile
              label="Streak"
              value={insights.streak.current}
              unit={insights.streak.current === 1 ? "day" : "days"}
              caption={`Best ${insights.streak.longest}`}
              accent
            />
            <StatTile
              label="This week"
              value={formatMinutes(insights.thisWeek.minutes)}
              caption={
                insights.lastWeek.minutes === 0
                  ? `${insights.thisWeek.daysElapsed} ${
                      insights.thisWeek.daysElapsed === 1 ? "day" : "days"
                    } in`
                  : `${weekDelta >= 0 ? "+" : ""}${weekDelta}m vs this point last week`
              }
            />
            <StatTile
              label="Avg session"
              value={insights.totals.averageSessionMinutes}
              unit="min"
              caption="Last 4 weeks"
            />
            <StatTile
              label="Days practised"
              value={insights.totals.daysPractised}
              unit={`/ ${insights.range.days}`}
              caption="Last 4 weeks"
            />
          </div>

          <MinutesBars
            title="The last two weeks"
            subtitle="Minutes at the piano each day"
            points={last14}
            targetMinutes={dailyGoal?.target ?? null}
          />
        </>
      )}

      <section>
        <SectionHeading
          title="Goals"
          subtitle="What you're aiming at right now"
          action={
            <Link to="/practice/goals" className="btn-ghost text-sm">
              {goals.length > 0 ? "Manage goals" : "Set a goal"}
            </Link>
          }
        />
        {goals.length === 0 ? (
          <EmptyState
            title="No goals yet"
            body="A goal turns practice from a habit into a plan — minutes a week, days a month, or a tempo to reach on a piece."
            action={
              <Link to="/practice/goals" className="btn-primary">
                Set your first goal
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
            {goals.slice(0, 4).map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </section>

      {stale.length > 0 && (
        <section>
          <SectionHeading
            title="Gone quiet"
            subtitle="Active pieces you haven't touched in a couple of weeks"
            action={
              <Link to="/practice/repertoire" className="btn-ghost text-sm">
                Repertoire
              </Link>
            }
          />
          <ul className="grid gap-2 sm:grid-cols-2">
            {stale.map((piece) => (
              <li key={piece.id} className="card flex items-center justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-100">{piece.title}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {piece.composer ?? "—"} ·{" "}
                    {piece.lastPracticed ? relativeDay(piece.lastPracticed) : "never practised"}
                  </p>
                </div>
                <Link to="/practice/log" className="btn-ghost shrink-0 px-3 py-1.5 text-xs">
                  Practise
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sessions.length > 0 && (
        <section>
          <SectionHeading
            title="Recent sessions"
            action={
              <Link to="/practice/sessions" className="btn-ghost text-sm">
                Full history
              </Link>
            }
          />
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li key={session.id}>
                <Link
                  to={`/practice/log/${session.id}`}
                  className="card flex items-center gap-3 py-3.5 transition hover:border-white/20"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline gap-2">
                      <span className="font-medium text-zinc-100">{relativeDay(session.date)}</span>
                      <span className="font-mono text-xs text-zinc-400">
                        {formatMinutes(session.totalMinutes)}
                      </span>
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5">
                      {session.segments.slice(0, 4).map((segment) => (
                        <span
                          key={segment.id}
                          className="flex items-center gap-1 text-xs text-zinc-500"
                        >
                          <span
                            aria-hidden
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: FOCUS_META[segment.focusArea].color }}
                          />
                          {segmentTitle(segment)}
                        </span>
                      ))}
                      {session.segments.length > 4 && (
                        <span className="text-xs text-zinc-600">
                          +{session.segments.length - 4} more
                        </span>
                      )}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
