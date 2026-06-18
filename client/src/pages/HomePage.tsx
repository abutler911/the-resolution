import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookIcon, ChartIcon, EarIcon, TrainerIcon } from "../components/icons";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-16">
      <section className="animate-fade-up text-center">
        <span className="chip mb-5 inline-flex">🎹 Train your musical ear</span>
        <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Master music theory,
          <br />
          <span className="gradient-text animate-gradient">
            one resolution at a time.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
          Drill intervals and chords, hear them played, train your ear, and
          watch your accuracy climb. Named for the moment tension finally
          resolves.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/trainer" className="btn-primary px-6 py-3 text-base">
            Start training
          </Link>
          <Link to="/ear-training" className="btn-ghost px-6 py-3 text-base">
            Try ear training
          </Link>
        </div>
        {!user && (
          <p className="mt-4 text-sm text-zinc-500">
            Free to play —{" "}
            <Link to="/register" className="text-tension hover:underline">
              create an account
            </Link>{" "}
            to track progress.
          </p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Feature
          icon={<TrainerIcon className="text-tension" />}
          title="Trainer"
          body="See the notes and name the interval, chord, or scale. Rapid-fire."
        />
        <Feature
          icon={<EarIcon className="text-accent" />}
          title="Ear Training"
          body="No notes shown — identify what you hear by ear alone."
        />
        <Feature
          icon={<BookIcon className="text-resolve" />}
          title="Lessons"
          body="Focused theory: circle of fifths, modes, diatonic chords."
        />
        <Feature
          icon={<ChartIcon className="text-tension" />}
          title="Progress"
          body="Streaks and per-topic accuracy so you know what to drill."
        />
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="card transition hover:-translate-y-1 hover:border-white/20">
      <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5">
        {icon}
      </div>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mt-1.5 text-sm text-zinc-400">{body}</p>
    </div>
  );
}
