import { playNotes } from "../lib/audio";
import { noteName } from "../lib/notes";

// A responsive piano keyboard. Highlights a set of MIDI pitches and (optionally)
// plays a note when a key is clicked.

const WHITE_PCS = [0, 2, 4, 5, 7, 9, 11];

function isWhite(midi: number): boolean {
  return WHITE_PCS.includes(((midi % 12) + 12) % 12);
}

export function Piano({
  highlight = [],
  from = 60,
  to = 84,
  playable = true,
}: {
  highlight?: number[];
  from?: number;
  to?: number;
  playable?: boolean;
}) {
  const keys: number[] = [];
  for (let m = from; m <= to; m++) keys.push(m);
  const whites = keys.filter(isWhite);
  const whiteW = 100 / whites.length;
  const set = new Set(highlight);

  function press(midi: number) {
    if (playable) void playNotes([midi], "harmonic");
  }

  return (
    <div className="relative mx-auto h-28 w-full select-none">
      {/* White keys */}
      <div className="flex h-full w-full">
        {whites.map((midi) => {
          const on = set.has(midi);
          return (
            <button
              key={midi}
              onClick={() => press(midi)}
              className={`flex h-full flex-1 items-end justify-center rounded-b-md border border-black/40 pb-1.5 text-[9px] transition ${
                on
                  ? "bg-brand text-white shadow-glow"
                  : "bg-zinc-100 text-zinc-400 hover:bg-white"
              }`}
            >
              {on ? noteName(midi) : ""}
            </button>
          );
        })}
      </div>

      {/* Black keys, positioned over the gaps */}
      {keys
        .filter((m) => !isWhite(m))
        .map((midi) => {
          const whitesBelow = whites.filter((w) => w < midi).length;
          const left = whiteW * (whitesBelow - 0.3);
          const on = set.has(midi);
          return (
            <button
              key={midi}
              onClick={() => press(midi)}
              style={{ left: `${left}%`, width: `${whiteW * 0.6}%` }}
              className={`absolute top-0 z-10 h-16 rounded-b-md border border-black/60 transition ${
                on ? "bg-accent shadow-glow" : "bg-zinc-900 hover:bg-zinc-800"
              }`}
            />
          );
        })}
    </div>
  );
}
