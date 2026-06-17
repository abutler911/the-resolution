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

  if (loading) return <p className="text-slate-500">Loading progress…</p>;
  if (!summary) return null;

  const overall = summary.totals.total
    ? Math.round((summary.totals.correct / summary.totals.total) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">
          Hey {user?.displayName} 👋
        </h1>
        <p className="text-slate-600">Here's how your practice is going.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Current streak" value={`${summary.streak} 🔥`} />
        <StatCard label="Overall accuracy" value={`${overall}%`} />
        <StatCard
          label="Lessons completed"
          value={String(summary.completedLessons)}
        />
      </div>

      <div className="card">
        <h2 className="mb-4 font-display text-lg font-semibold">By topic</h2>
        {Object.keys(summary.byType).length === 0 ? (
          <p className="text-sm text-slate-500">
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
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">
                      {TYPE_LABELS[type] ?? type}
                    </span>
                    <span className="text-slate-500">
                      {stat.correct}/{stat.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-tension"
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card text-center">
      <p className="text-3xl font-bold text-tension">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
