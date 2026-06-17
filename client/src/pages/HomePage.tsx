import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="font-display text-4xl font-bold text-slate-900 sm:text-5xl">
          Master music theory,
          <span className="text-tension"> one resolution at a time.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Drill intervals and chords, read focused lessons, and watch your
          accuracy climb. Named for the moment tension finally resolves.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/trainer" className="btn-primary">
            Start training
          </Link>
          {!user && (
            <Link to="/register" className="btn-ghost">
              Create an account
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <FeatureCard
          title="Interval & Chord Trainer"
          body="Rapid-fire quizzes that adapt as you go. Name what you hear and see."
        />
        <FeatureCard
          title="Focused Lessons"
          body="Bite-sized theory — from the circle of fifths to the modes."
        />
        <FeatureCard
          title="Progress Tracking"
          body="Streaks and per-topic accuracy so you know what to practice next."
        />
      </section>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card">
      <h2 className="font-display text-lg font-semibold text-tension">
        {title}
      </h2>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
    </div>
  );
}
