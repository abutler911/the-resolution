/**
 * Music theory helpers — the domain core of The Resolution.
 *
 * Notes are represented as pitch classes 0–11 (C=0). Question generators
 * return a human-readable prompt, the correct answer, an educational
 * explanation, and absolute MIDI pitches for audio playback.
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

const INTERVAL_INFO: Record<string, string> = {
  "Unison": "two notes at the same pitch — perfect consonance.",
  "Minor 2nd": "the tightest, most dissonant step in Western music.",
  "Major 2nd": "a whole step — the basic building block of scales.",
  "Minor 3rd": "the darker third that gives minor chords their colour.",
  "Major 3rd": "the bright third that defines major chords.",
  "Perfect 4th": "stable, but with a gentle pull to resolve downward.",
  "Tritone": "the restless 'devil's interval' that craves resolution.",
  "Perfect 5th": "the most consonant interval after the octave; the root of power chords.",
  "Minor 6th": "an inverted major 3rd — warm and expressive.",
  "Major 6th": "an inverted minor 3rd — open and sweet.",
  "Minor 7th": "the bluesy tension at the heart of dominant chords.",
  "Major 7th": "a lush, jazzy interval one semitone below the octave.",
  "Octave": "the same note doubled — pure consonance.",
};

// --- Chords ----------------------------------------------------------------

export const CHORD_QUALITIES: Record<string, number[]> = {
  "Major": [0, 4, 7],
  "Minor": [0, 3, 7],
  "Diminished": [0, 3, 6],
  "Augmented": [0, 4, 8],
  "Suspended 2nd": [0, 2, 7],
  "Suspended 4th": [0, 5, 7],
  "Major 6th": [0, 4, 7, 9],
  "Minor 6th": [0, 3, 7, 9],
  "Major 7th": [0, 4, 7, 11],
  "Dominant 7th": [0, 4, 7, 10],
  "Minor 7th": [0, 3, 7, 10],
  "Half-diminished 7th": [0, 3, 6, 10],
  "Diminished 7th": [0, 3, 6, 9],
  "Dominant 9th": [0, 4, 7, 10, 14],
};

const CHORD_INFO: Record<string, string> = {
  "Major": "root, major 3rd, perfect 5th — bright and stable.",
  "Minor": "root, minor 3rd, perfect 5th — the major chord's darker shadow.",
  "Diminished": "two stacked minor 3rds (root, ♭3, ♭5) — tense and unstable.",
  "Augmented": "two stacked major 3rds (root, 3, ♯5) — dreamlike and unresolved.",
  "Suspended 2nd": "the 3rd is replaced by the 2nd — open and unresolved.",
  "Suspended 4th": "the 3rd is replaced by the 4th — it wants to resolve down to the 3rd.",
  "Major 6th": "a major triad plus a major 6th — sweet and vintage.",
  "Minor 6th": "a minor triad plus a major 6th — moody, with a bright top note.",
  "Major 7th": "a major triad plus a major 7th — lush and jazzy.",
  "Dominant 7th": "a major triad plus a ♭7 — bluesy; pulls strongly toward the tonic.",
  "Minor 7th": "a minor triad plus a ♭7 — smooth and mellow.",
  "Half-diminished 7th": "a diminished triad plus a ♭7 — the classic ii° of a minor key.",
  "Diminished 7th": "stacked minor 3rds all the way up — symmetrical and maximally tense.",
  "Dominant 9th": "a dominant 7th extended with a 9th — rich and funky.",
};

// --- Scales ----------------------------------------------------------------

export const SCALES: Record<string, number[]> = {
  "Major (Ionian)": [0, 2, 4, 5, 7, 9, 11],
  "Natural Minor (Aeolian)": [0, 2, 3, 5, 7, 8, 10],
  "Dorian": [0, 2, 3, 5, 7, 9, 10],
  "Phrygian": [0, 1, 3, 5, 7, 8, 10],
  "Lydian": [0, 2, 4, 6, 7, 9, 11],
  "Mixolydian": [0, 2, 4, 5, 7, 9, 10],
  "Locrian": [0, 1, 3, 5, 6, 8, 10],
  "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
  "Melodic Minor": [0, 2, 3, 5, 7, 9, 11],
  "Major Pentatonic": [0, 2, 4, 7, 9],
  "Minor Pentatonic": [0, 3, 5, 7, 10],
  "Blues": [0, 3, 5, 6, 7, 10],
  "Whole Tone": [0, 2, 4, 6, 8, 10],
};

const SCALE_INFO: Record<string, string> = {
  "Major (Ionian)": "the do-re-mi major scale — bright and resolved.",
  "Natural Minor (Aeolian)": "the natural minor — darker, built on the 6th degree of the major.",
  "Dorian": "minor with a raised 6th — jazzy and hopeful.",
  "Phrygian": "minor with a ♭2 — Spanish, exotic, dark.",
  "Lydian": "major with a ♯4 — dreamy and floating.",
  "Mixolydian": "major with a ♭7 — bluesy; the dominant-chord scale.",
  "Locrian": "♭2 and ♭5 — the most unstable mode.",
  "Harmonic Minor": "natural minor with a raised 7th — that exotic augmented-2nd pull.",
  "Melodic Minor": "minor with raised 6th and 7th — smooth voice-leading to the tonic.",
  "Major Pentatonic": "five notes, no semitones — the 'no wrong notes' scale.",
  "Minor Pentatonic": "the backbone of rock and blues soloing.",
  "Blues": "minor pentatonic plus the ♭5 'blue note' — gritty and expressive.",
  "Whole Tone": "all whole steps — symmetrical, ambiguous, dreamlike.",
};

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function pick<T>(items: T[]): T {
  return items[randomInt(items.length)];
}

// Anchor generated pitches around C4 (MIDI 60) for a comfortable range.
const BASE_MIDI = 60;

export interface GeneratedQuestion {
  type: "INTERVAL" | "CHORD_QUALITY" | "SCALE";
  prompt: string;
  notes: string[];
  // Absolute MIDI pitch numbers for audio playback. Unlike `notes` (pitch
  // classes), these preserve octave and ordering so e.g. an octave interval
  // sounds an octave apart.
  midi: number[];
  correctAnswer: string;
  // A short teaching explanation of why the answer is what it is.
  explanation: string;
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

// Render a scale's interval pattern as whole/half steps, e.g. "W–W–H–…".
function stepPattern(intervals: number[]): string {
  const full = [...intervals, 12];
  const steps: string[] = [];
  for (let i = 1; i < full.length; i++) {
    const d = full[i] - full[i - 1];
    steps.push(d === 1 ? "H" : d === 2 ? "W" : d === 3 ? "W½" : `${d}`);
  }
  return steps.join("–");
}

export function generateIntervalQuestion(): GeneratedQuestion {
  const root = randomInt(12);
  const [name, semitones] = pick(Object.entries(INTERVALS));
  const top = root + semitones;
  const lo = noteName(root);
  const hi = noteName(top);
  return {
    type: "INTERVAL",
    prompt: `What interval is ${lo} → ${hi}?`,
    notes: [lo, hi],
    midi: [BASE_MIDI + root, BASE_MIDI + top],
    correctAnswer: name,
    explanation: `${lo} → ${hi} is a ${name} — ${semitones} semitone${
      semitones === 1 ? "" : "s"
    }. ${INTERVAL_INFO[name] ?? ""}`,
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
    midi: intervals.map((i) => BASE_MIDI + root + i),
    correctAnswer: quality,
    explanation: `${notes[0]} ${quality} = ${notes.join(" – ")}. ${
      CHORD_INFO[quality] ?? ""
    }`,
    choices: withDistractors(quality, Object.keys(CHORD_QUALITIES)),
  };
}

export function generateScaleQuestion(): GeneratedQuestion {
  const root = randomInt(12);
  const [name, intervals] = pick(Object.entries(SCALES));
  const notes = intervals.map((i) => noteName(root + i));
  // Append the octave so the scale resolves nicely when played.
  const playedIntervals = [...intervals, 12];
  return {
    type: "SCALE",
    prompt: `Which scale/mode is this? ${notes.join(" ")}`,
    notes,
    midi: playedIntervals.map((i) => BASE_MIDI + root + i),
    correctAnswer: name,
    explanation: `${notes[0]} ${name}: ${notes.join(
      " ",
    )}. Step pattern ${stepPattern(intervals)}. ${SCALE_INFO[name] ?? ""}`,
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
