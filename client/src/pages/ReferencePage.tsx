import { CircleOfFifths } from "../components/CircleOfFifths";
import { Piano } from "../components/Piano";

export default function ReferencePage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          <span className="gradient-text">Reference</span>
        </h1>
        <p className="mt-1 text-zinc-400">
          Interactive tools to explore the building blocks of theory.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Circle of Fifths</h2>
        <p className="text-sm text-zinc-400">
          Tap a key to see its signature and relative minor. Each step clockwise
          adds a sharp; counter-clockwise adds a flat.
        </p>
        <CircleOfFifths />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Keyboard</h2>
        <p className="text-sm text-zinc-400">
          Tap any key to hear it.
        </p>
        <div className="card">
          <Piano from={60} to={84} />
        </div>
      </section>
    </div>
  );
}
