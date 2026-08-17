/**
 * The theory corner: the drills and reference material that used to be the
 * whole app, gathered behind one door now that practice tracking leads.
 */

import { Link } from "react-router-dom";
import {
  BookIcon,
  ChartIcon,
  EarIcon,
  GlossaryIcon,
  ReferenceIcon,
  TrainerIcon,
} from "../components/icons";
import { useAuth } from "../context/AuthContext";

const TOOLS = [
  {
    to: "/trainer",
    title: "Trainer",
    body: "See the notes and name the interval, chord, scale or key signature.",
    icon: <TrainerIcon className="text-tension" />,
  },
  {
    to: "/ear-training",
    title: "Ear training",
    body: "No notes shown — identify what you hear by ear alone.",
    icon: <EarIcon className="text-accent" />,
  },
  {
    to: "/lessons",
    title: "Lessons",
    body: "Focused reading: the circle of fifths, modes, diatonic chords.",
    icon: <BookIcon className="text-resolve" />,
  },
  {
    to: "/reference",
    title: "Reference",
    body: "The keyboard and the circle of fifths, laid out to look at.",
    icon: <ReferenceIcon className="text-tension" />,
  },
  {
    to: "/glossary",
    title: "Glossary",
    body: "Search the vocabulary — from appoggiatura to voice leading.",
    icon: <GlossaryIcon className="text-accent" />,
  },
  {
    to: "/progress",
    title: "Drill progress",
    body: "Accuracy per topic, so you know what to drill next.",
    icon: <ChartIcon className="text-resolve" />,
    authOnly: true,
  },
];

export default function TheoryPage() {
  const { user } = useAuth();
  const tools = TOOLS.filter((tool) => !tool.authOnly || user);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Theory</h1>
        <p className="mt-1 text-zinc-400">
          The drills and reference that sit behind the playing.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.to}
            to={tool.to}
            className="card transition hover:-translate-y-0.5 hover:border-white/20"
          >
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5">
              {tool.icon}
            </div>
            <h2 className="font-display text-lg font-semibold">{tool.title}</h2>
            <p className="mt-1.5 text-sm text-zinc-400">{tool.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
