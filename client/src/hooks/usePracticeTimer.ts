import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A stopwatch for the segment being practised right now.
 *
 * Elapsed time is derived from wall-clock timestamps rather than counted by
 * the interval, so a backgrounded tab (where browsers throttle timers) still
 * comes back with the right number of minutes on it.
 */
export function usePracticeTimer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  // Accumulated seconds from previous runs, plus when the current run began.
  const bankedRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;

    const tick = () => {
      const started = startedAtRef.current;
      if (started == null) return;
      setElapsed(bankedRef.current + (Date.now() - started) / 1000);
    };

    tick();
    const id = window.setInterval(tick, 250);
    // Re-sync the moment the tab is looked at again.
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [running]);

  const start = useCallback(() => {
    if (startedAtRef.current != null) return;
    startedAtRef.current = Date.now();
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    const started = startedAtRef.current;
    if (started != null) {
      bankedRef.current += (Date.now() - started) / 1000;
      startedAtRef.current = null;
    }
    setElapsed(bankedRef.current);
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    bankedRef.current = 0;
    startedAtRef.current = null;
    setElapsed(0);
    setRunning(false);
  }, []);

  const toggle = useCallback(() => {
    if (startedAtRef.current != null) pause();
    else start();
  }, [pause, start]);

  return {
    running,
    elapsedSeconds: elapsed,
    /** Rounded up, because a 40-second run-through is a minute of practice. */
    elapsedMinutes: Math.max(elapsed > 0 ? 1 : 0, Math.round(elapsed / 60)),
    start,
    pause,
    reset,
    toggle,
  };
}
