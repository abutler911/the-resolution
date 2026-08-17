/**
 * A metronome for the practice logger.
 *
 * Timers in JavaScript drift; audio clocks don't. So the beat is *scheduled*
 * on the Web Audio clock a little ahead of time, and a coarse interval timer
 * only tops the schedule up. That keeps the click steady even when the main
 * thread is busy re-rendering the page.
 */

import { getContext } from "./audio";

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.12;

export class Metronome {
  private timer: number | null = null;
  private nextBeatTime = 0;
  private beat = 0;

  constructor(
    private bpm = 80,
    private beatsPerBar = 4,
    /** Called with the beat index inside the bar, for the visual pulse. */
    private onBeat?: (beatInBar: number) => void,
  ) {}

  get running(): boolean {
    return this.timer !== null;
  }

  setTempo(bpm: number): void {
    this.bpm = Math.min(320, Math.max(20, bpm));
  }

  setBeatsPerBar(beats: number): void {
    this.beatsPerBar = Math.min(12, Math.max(1, beats));
  }

  async start(): Promise<void> {
    if (this.timer !== null) return;
    const ctx = getContext();
    if (ctx.state === "suspended") await ctx.resume();

    this.beat = 0;
    this.nextBeatTime = ctx.currentTime + 0.06;
    this.timer = window.setInterval(() => this.schedule(), LOOKAHEAD_MS);
  }

  stop(): void {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  private schedule(): void {
    const ctx = getContext();
    const secondsPerBeat = 60 / this.bpm;

    while (this.nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
      const beatInBar = this.beat % this.beatsPerBar;
      this.click(ctx, this.nextBeatTime, beatInBar === 0);

      if (this.onBeat) {
        // Fire the visual pulse when the click actually sounds, not when it
        // was scheduled.
        const delay = Math.max(0, (this.nextBeatTime - ctx.currentTime) * 1000);
        window.setTimeout(() => this.onBeat?.(beatInBar), delay);
      }

      this.nextBeatTime += secondsPerBeat;
      this.beat += 1;
    }
  }

  // A short pitched blip; the downbeat sits an octave up so bars are audible.
  private click(ctx: AudioContext, at: number, isDownbeat: boolean): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.value = isDownbeat ? 1600 : 900;

    const peak = isDownbeat ? 0.16 : 0.1;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(peak, at + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.045);

    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + 0.06);
  }
}
