/**
 * Minimal Web Audio playback for The Resolution.
 *
 * No libraries, no audio files — pitches are synthesized with oscillators.
 * Notes can be played melodically (one after another) or harmonically
 * (all at once, like a chord).
 */

let context: AudioContext | null = null;

function getContext(): AudioContext {
  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    context = new Ctor();
  }
  return context;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Schedule a single note with a short attack/release envelope to avoid clicks.
function scheduleNote(
  ctx: AudioContext,
  midi: number,
  startAt: number,
  duration: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = midiToFrequency(midi);

  const peak = 0.22;
  const attack = 0.02;
  const release = 0.12;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peak, startAt + attack);
  gain.gain.setValueAtTime(peak, startAt + duration - release);
  gain.gain.linearRampToValueAtTime(0, startAt + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration);
}

export type PlayMode = "melodic" | "harmonic";

/**
 * Play a set of MIDI pitches. Must be triggered from a user gesture the first
 * time (browsers suspend audio until then) — calling resume() handles that.
 */
export async function playNotes(
  midi: number[],
  mode: PlayMode = "melodic",
): Promise<void> {
  const ctx = getContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  const now = ctx.currentTime + 0.05;
  const step = 0.55;

  if (mode === "harmonic") {
    for (const note of midi) {
      scheduleNote(ctx, note, now, 1.4);
    }
  } else {
    midi.forEach((note, i) => {
      scheduleNote(ctx, note, now + i * step, step * 0.95);
    });
  }
}
