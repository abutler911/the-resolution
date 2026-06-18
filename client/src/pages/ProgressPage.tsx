import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { ProgressSummary } from "../types";

const TYPE_LABELS: Record<string, string> = {
  INTERVAL: "Intervals",
  CHORD_QUALITY: "Chords",
  SCALE: "Scales",
};

export default function ProgressPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ProgressSummary>("/progress/summary")
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-zinc-500">Loading progress…</p>;
  if (!summary) return null;

  const overall = summary.totals.total
    ? Math.round((summary.totals.correct / summary.totals.total) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Hey {user?.displayName} 👋
        </h1>
        <p className="text-zinc-400">Here's how your practice is going.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Current streak" value={`${summary.streak}`} suffix="🔥" />
        <StatCard label="Overall accuracy" value={`${overall}`} suffix="%" />
        <StatCard
          label="Lessons completed"
          value={String(summary.completedLessons)}
        />
      </div>

      <div className="card">
        <h2 className="mb-4 font-display text-lg font-semibold">By topic</h2>
        {Object.keys(summary.byType).length === 0 ? (
          <p className="text-sm text-zinc-500">
            No attempts yet — head to the Trainer to get started.
          </p>
        ) : (
          <ul className="space-y-4">
            {Object.entries(summary.byType).map(([type, stat]) => {
              const pct = stat.total
                ? Math.round((stat.correct / stat.total) * 100)
                : 0;
              return (
                <li key={type}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">
                      {TYPE_LABELS[type] ?? type}
                    </span>
                    <span className="font-mono text-zinc-400">
                      {stat.correct}/{stat.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="card text-center">
      <p className="font-display text-4xl font-bold">
        <span className="gradient-text">{value}</span>
        {suffix && <span className="text-2xl">{suffix}</span>}
      </p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
    </div>
  );
}
