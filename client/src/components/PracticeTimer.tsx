/**
 * The bench console: a stopwatch for whatever you're playing right now, and a
 * metronome beside it so the tempo you log is the tempo you actually played.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { usePracticeTimer } from "../hooks/usePracticeTimer";
import { Metronome } from "../lib/metronome";
import { formatClock } from "../lib/practice";

export default function PracticeTimer({
  onLogMinutes,
  onTempoChange,
}: {
  /** Hand the elapsed time to the segment being written up. */
  onLogMinutes: (minutes: number) => void;
  /** Keep the segment's tempo field in step with the metronome. */
  onTempoChange?: (bpm: number) => void;
}) {
  const timer = usePracticeTimer();
  const [bpm, setBpm] = useState(80);
  const [clicking, setClicking] = useState(false);
  const [pulse, setPulse] = useState(-1);
  const metronomeRef = useRef<Metronome | null>(null);
  const tapsRef = useRef<number[]>([]);

  if (metronomeRef.current === null) {
    metronomeRef.current = new Metronome(80, 4, (beat) => setPulse(beat));
  }

  useEffect(() => {
    metronomeRef.current?.setTempo(bpm);
  }, [bpm]);

  // Never leave a click running when the page goes away.
  useEffect(() => () => metronomeRef.current?.stop(), []);

  const toggleMetronome = useCallback(async () => {
    const metronome = metronomeRef.current!;
    if (metronome.running) {
      metronome.stop();
      setClicking(false);
      setPulse(-1);
    } else {
      await metronome.start();
      setClicking(true);
    }
  }, []);

  /** Tap four beats and it takes the tempo from your hand. */
  const tapTempo = useCallback(() => {
    const now = Date.now();
    const taps = [...tapsRef.current, now].filter((tap) => now - tap < 3000).slice(-5);
    tapsRef.current = taps;
    if (taps.length < 2) return;

    const gaps = taps.slice(1).map((tap, i) => tap - taps[i]!);
    const average = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const tapped = Math.round(60000 / average);
    if (tapped >= 20 && tapped <= 320) {
      setBpm(tapped);
      onTempoChange?.(tapped);
    }
  }, [onTempoChange]);

  const minutes = timer.elapsedMinutes;

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Practice timer
          </p>
          <p className="mt-1 font-mono text-4xl font-bold tabular-nums text-white">
            {formatClock(timer.elapsedSeconds)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={timer.toggle}
            className={timer.running ? "btn-ghost" : "btn-primary"}
          >
            {timer.running ? "Pause" : timer.elapsedSeconds > 0 ? "Resume" : "Start"}
          </button>
          <button
            type="button"
            onClick={() => {
              onLogMinutes(minutes);
              timer.reset();
            }}
            disabled={minutes < 1}
            className="btn-accent"
          >
            {minutes >= 1 ? `Log ${minutes}m` : "Log time"}
          </button>
          {timer.elapsedSeconds > 0 && (
            <button type="button" onClick={timer.reset} className="btn-ghost text-sm">
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMetronome}
              aria-pressed={clicking}
              className={clicking ? "btn-primary text-sm" : "btn-ghost text-sm"}
            >
              {clicking ? "Stop click" : "Metronome"}
            </button>
            <div className="flex items-center gap-1" aria-hidden>
              {[0, 1, 2, 3].map((beat) => (
                <span
                  key={beat}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    clicking && pulse === beat
                      ? beat === 0
                        ? "scale-125 bg-resolve"
                        : "scale-125 bg-tension"
                      : "bg-white/15"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-sm tabular-nums text-zinc-300">{bpm} bpm</span>
            <button type="button" onClick={tapTempo} className="btn-ghost px-3 py-1.5 text-xs">
              Tap
            </button>
          </div>
        </div>

        <label className="mt-3 block">
          <span className="sr-only">Metronome tempo</span>
          <input
            type="range"
            min={40}
            max={220}
            value={bpm}
            onChange={(event) => {
              const next = Number(event.target.value);
              setBpm(next);
              onTempoChange?.(next);
            }}
            className="w-full accent-tension"
          />
        </label>
      </div>
    </div>
  );
}
