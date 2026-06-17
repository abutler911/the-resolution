/**
 * Music theory helpers — the domain core of The Resolution.
 *
 * Notes are represented as pitch classes 0–11 (C=0). Question generators
 * return both a human-readable prompt and the correct answer label so the
 * same shape can be stored in ExerciseAttempt and rendered on the client.
 */

export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

export function noteName(pitchClass: number): NoteName {
  return NOTE_NAMES[((pitchClass % 12) + 12) % 12];
}

// --- Intervals -------------------------------------------------------------

export const INTERVALS: Record<string, number> = {
  "Unison": 0,
  "Minor 2nd": 1,
  "Major 2nd": 2,
  "Minor 3rd": 3,
  "Major 3rd": 4,
  "Perfect 4th": 5,
  "Tritone": 6,
  "Perfect 5th": 7,
  "Minor 6th": 8,
  "Major 6th": 9,
  "Minor 7th": 10,
  "Major 7th": 11,
  "Octave": 12,
};

// --- Chords ----------------------------------------------------------------

export const CHORD_QUALITIES: Record<string, number[]> = {
  "Major": [0, 4, 7],
  "Minor": [0, 3, 7],
  "Diminished": [0, 3, 6],
  "Augmented": [0, 4, 8],
  "Major 7th": [0, 4, 7, 11],
  "Dominant 7th": [0, 4, 7, 10],
  "Minor 7th": [0, 3, 7, 10],
  "Half-diminished 7th": [0, 3, 6, 10],
};

// --- Scales ----------------------------------------------------------------

export const SCALES: Record<string, number[]> = {
  "Major (Ionian)": [0, 2, 4, 5, 7, 9, 11],
  "Natural Minor (Aeolian)": [0, 2, 3, 5, 7, 8, 10],
  "Dorian": [0, 2, 3, 5, 7, 9, 10],
  "Phrygian": [0, 1, 3, 5, 7, 8, 10],
  "Lydian": [0, 2, 4, 6, 7, 9, 11],
  "Mixolydian": [0, 2, 4, 5, 7, 9, 10],
  "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
  "Melodic Minor": [0, 2, 3, 5, 7, 9, 11],
};

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function pick<T>(items: T[]): T {
  return items[randomInt(items.length)];
}

export interface GeneratedQuestion {
  type: "INTERVAL" | "CHORD_QUALITY" | "SCALE";
  prompt: string;
  notes: string[];
  correctAnswer: string;
  choices: string[];
}

function withDistractors(answer: string, pool: string[], count = 4): string[] {
  const others = pool.filter((o) => o !== answer);
  const chosen: string[] = [];
  while (chosen.length < count - 1 && others.length) {
    const idx = randomInt(others.length);
    chosen.push(others.splice(idx, 1)[0]);
  }
  const choices = [...chosen, answer];
  // Fisher–Yates shuffle so the answer isn't always last.
  for (let i = choices.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}

export function generateIntervalQuestion(): GeneratedQuestion {
  const root = randomInt(12);
  const [name, semitones] = pick(Object.entries(INTERVALS));
  const top = root + semitones;
  return {
    type: "INTERVAL",
    prompt: `What interval is ${noteName(root)} → ${noteName(top)}?`,
    notes: [noteName(root), noteName(top)],
    correctAnswer: name,
    choices: withDistractors(name, Object.keys(INTERVALS)),
  };
}

export function generateChordQuestion(): GeneratedQuestion {
  const root = randomInt(12);
  const [quality, intervals] = pick(Object.entries(CHORD_QUALITIES));
  const notes = intervals.map((i) => noteName(root + i));
  return {
    type: "CHORD_QUALITY",
    prompt: `Name the chord quality: ${notes.join(" – ")}`,
    notes,
    correctAnswer: quality,
    choices: withDistractors(quality, Object.keys(CHORD_QUALITIES)),
  };
}

export function generateScaleQuestion(): GeneratedQuestion {
  const root = randomInt(12);
  const [name, intervals] = pick(Object.entries(SCALES));
  const notes = intervals.map((i) => noteName(root + i));
  return {
    type: "SCALE",
    prompt: `Which scale/mode is this? ${notes.join(" ")}`,
    notes,
    correctAnswer: name,
    choices: withDistractors(name, Object.keys(SCALES)),
  };
}

export function generateQuestion(
  type: "INTERVAL" | "CHORD_QUALITY" | "SCALE",
): GeneratedQuestion {
  switch (type) {
    case "INTERVAL":
      return generateIntervalQuestion();
    case "CHORD_QUALITY":
      return generateChordQuestion();
    case "SCALE":
      return generateScaleQuestion();
  }
}
