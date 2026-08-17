import { Link } from "react-router-dom";
import {
  ChartIcon,
  LogIcon,
  RepertoireIcon,
  TargetIcon,
  TheoryIcon,
} from "../components/icons";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="animate-fade-up text-center">
        <span className="chip mb-5 inline-flex">🎹 Practice tracking for pianists</span>
        <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Know exactly what
          <br />
          <span className="gradient-text animate-gradient">your practice is doing.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
          Log the piece, the passage, the tempo and how it felt. Set goals worth
          chasing. Then watch the hours turn into progress you can actually see —
          named for the moment tension finally resolves.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/register" className="btn-primary px-6 py-3 text-base">
            Start your practice log
          </Link>
          <Link to="/theory" className="btn-ghost px-6 py-3 text-base">
            Explore the theory tools
          </Link>
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          Already have an account?{" "}
          <Link to="/login" className="text-tension hover:underline">
            Sign in
          </Link>
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Feature
          icon={<LogIcon className="text-tension" />}
          title="Log what you actually did"
          body="Not just “45 minutes”. The piece, the bars, the tempo you held, hands together or apart, and how it went."
        />
        <Feature
          icon={<TargetIcon className="text-resolve" />}
          title="Goals that fit practice"
          body="Minutes a day, days a week, an hour of scales a month, or a piece up to 120bpm before the recital."
        />
        <Feature
          icon={<ChartIcon className="text-accent" />}
          title="See the trend"
          body="Streaks, a practice calendar, where the hours really go, and the tempo climb on every piece."
        />
        <Feature
          icon={<RepertoireIcon className="text-tension" />}
          title="Your repertoire, tracked"
          body="Wishlist to performance-ready. Every piece carries its own history of time, tempo and feel."
        />
        <Feature
          icon={<LogIcon className="text-resolve" />}
          title="Timer and metronome built in"
          body="Time the segment you're playing, tap out the tempo, and log it without leaving the bench."
        />
        <Feature
          icon={<TheoryIcon className="text-accent" />}
          title="Theory when you need it"
          body="The original drills are still here: intervals, chords, scales, ear training and a searchable glossary."
        />
      </section>

      <section className="card text-center">
        <h2 className="font-display text-2xl font-bold">
          Practice you can look back on
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-zinc-400">
          Six months from now, the question isn't “did I practise?” — it's “what
          did I do about that passage, and did it work?” This keeps the answer.
        </p>
        <Link to="/register" className="btn-primary mt-6 inline-flex px-6 py-3 text-base">
          Create a free account
        </Link>
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
