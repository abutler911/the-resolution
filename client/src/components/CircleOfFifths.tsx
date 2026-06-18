import { useState } from "react";

interface Key {
  major: string;
  minor: string;
  signature: string;
}

// Clockwise from the top: each step adds a sharp (or removes a flat).
const KEYS: Key[] = [
  { major: "C", minor: "Am", signature: "no sharps or flats" },
  { major: "G", minor: "Em", signature: "1 sharp — F♯" },
  { major: "D", minor: "Bm", signature: "2 sharps — F♯ C♯" },
  { major: "A", minor: "F♯m", signature: "3 sharps — F♯ C♯ G♯" },
  { major: "E", minor: "C♯m", signature: "4 sharps — F♯ C♯ G♯ D♯" },
  { major: "B", minor: "G♯m", signature: "5 sharps — F♯ C♯ G♯ D♯ A♯" },
  { major: "G♭", minor: "E♭m", signature: "6 flats — B♭ E♭ A♭ D♭ G♭ C♭" },
  { major: "D♭", minor: "B♭m", signature: "5 flats — B♭ E♭ A♭ D♭ G♭" },
  { major: "A♭", minor: "Fm", signature: "4 flats — B♭ E♭ A♭ D♭" },
  { major: "E♭", minor: "Cm", signature: "3 flats — B♭ E♭ A♭" },
  { major: "B♭", minor: "Gm", signature: "2 flats — B♭ E♭" },
  { major: "F", minor: "Dm", signature: "1 flat — B♭" },
];

const SIZE = 320;
const C = SIZE / 2;

function pos(index: number, radius: number) {
  const angle = (index * 30 - 90) * (Math.PI / 180);
  return { x: C + radius * Math.cos(angle), y: C + radius * Math.sin(angle) };
}

export function CircleOfFifths() {
  const [selected, setSelected] = useState(0);
  const key = KEYS[selected];

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-sm"
        role="img"
        aria-label="Circle of fifths"
      >
        <circle cx={C} cy={C} r={150} className="fill-white/[0.03] stroke-white/10" />
        <circle cx={C} cy={C} r={78} className="fill-white/[0.02] stroke-white/10" />

        {KEYS.map((k, i) => {
          const outer = pos(i, 124);
          const inner = pos(i, 100);
          const active = i === selected;
          return (
            <g
              key={k.major}
              onClick={() => setSelected(i)}
              className="cursor-pointer"
            >
              {/* hit area */}
              <circle cx={outer.x} cy={outer.y} r={20} className="fill-transparent" />
              <text
                x={outer.x}
                y={outer.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`font-display text-[15px] font-bold ${
                  active ? "fill-resolve" : "fill-zinc-100"
                }`}
              >
                {k.major}
              </text>
              <text
                x={inner.x}
                y={inner.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-[11px] ${
                  active ? "fill-accent" : "fill-zinc-500"
                }`}
              >
                {k.minor}
              </text>
            </g>
          );
        })}

        <text
          x={C}
          y={C}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-zinc-500 text-[10px] uppercase tracking-widest"
        >
          fifths →
        </text>
      </svg>

      <div className="card w-full max-w-sm text-center">
        <p className="font-display text-xl font-bold">
          <span className="gradient-text">{key.major} major</span>
          <span className="text-zinc-500"> / {key.minor}</span>
        </p>
        <p className="mt-1 text-sm text-zinc-400">{key.signature}</p>
      </div>
    </div>
  );
}
