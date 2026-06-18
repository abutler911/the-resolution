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

export type ExerciseKind =
  | "INTERVAL"
  | "CHORD_QUALITY"
  | "SCALE"
  | "KEY_SIGNATURE";

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
  "Unison": "Two notes at the exact same pitch — perfect consonance, zero distance. It's the reference point all other intervals are measured from.",
  "Minor 2nd": "At just one semitone, it's the smallest and most dissonant step in Western music — the menace of the 'Jaws' theme. Invert it and you get a major 7th.",
  "Major 2nd": "A whole step (two semitones) — the basic stride of most scales, as in the first two notes of 'Happy Birthday'. Its inversion is the minor 7th.",
  "Minor 3rd": "Three semitones — the darker third that gives minor chords their melancholy. It's the opening leap of 'Greensleeves'; inverted it becomes a major 6th.",
  "Major 3rd": "Four semitones — the bright, stable third that defines major chords, like the start of 'When the Saints Go Marching In'. It inverts to a minor 6th.",
  "Perfect 4th": "Five semitones — strong and open (the 'Here Comes the Bride' leap), but with a subtle pull to resolve down to the 3rd. It inverts to a perfect 5th.",
  "Tritone": "Six semitones, exactly half an octave — the restless 'diabolus in musica' whose instability drives the dominant chord's pull home. It's its own inversion.",
  "Perfect 5th": "Seven semitones — the most consonant interval after the octave and the foundation of power chords, as in 'Twinkle, Twinkle'. It inverts to a perfect 4th.",
  "Minor 6th": "Eight semitones — an inverted major 3rd, warm and yearning, like the opening of 'The Entertainer'. Common in expressive, romantic melodies.",
  "Major 6th": "Nine semitones — an inverted minor 3rd, open and sweet, as in 'My Bonnie Lies Over the Ocean'. A favourite leap in folk and pop.",
  "Minor 7th": "Ten semitones — the bluesy tension at the core of every dominant 7th chord. Think the first two notes of the 'Star Trek' theme; it inverts to a major 2nd.",
  "Major 7th": "Eleven semitones — lush and jazzy, sitting just one semitone below the octave and leaning hard toward it. It inverts to a minor 2nd.",
  "Octave": "Twelve semitones — the same note doubled at double the frequency. So consonant the two pitches sound like 'the same note', higher and lower.",
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
  "Major": "Spelled 1–3–5 (root, major 3rd, perfect 5th), it's the bright, stable, 'happy' chord that anchors most Western music. The major 3rd on the bottom is what makes it sound resolved.",
  "Minor": "Spelled 1–♭3–5 — the same as major but with the 3rd lowered a semitone, which flips the mood from bright to sombre. It's the major chord's darker shadow.",
  "Diminished": "Spelled 1–♭3–♭5 — two stacked minor 3rds. The flattened 5th creates a tense tritone with the root, so it sounds unstable and eager to resolve. It's the vii° of a major key.",
  "Augmented": "Spelled 1–3–♯5 — two stacked major 3rds. Perfectly symmetrical, it has no clear home key, giving it a dreamlike, suspended quality used to build tension.",
  "Suspended 2nd": "Spelled 1–2–5 — the 3rd is replaced by the 2nd. With no 3rd, it's neither major nor minor: open and ambiguous, it floats until the 3rd 'resolves' the suspension.",
  "Suspended 4th": "Spelled 1–4–5 — the 3rd is replaced by the 4th, creating tension that classically falls back down to the 3rd (the 'Pinball Wizard' sound).",
  "Major 6th": "A major triad plus a major 6th (1–3–5–6) — sweet and vintage, evoking 1940s jazz and barbershop. Softer and more relaxed than a major 7th.",
  "Minor 6th": "A minor triad plus a major 6th (1–♭3–5–6) — moody underneath but with a bright top note. A staple of film noir and bossa nova.",
  "Major 7th": "A major triad plus a major 7th (1–3–5–7) — lush, dreamy and unmistakably jazzy. The 7th sits a semitone below the octave, adding shimmer without much tension.",
  "Dominant 7th": "A major triad plus a ♭7 (1–3–5–♭7) — the engine of tension and resolution. Its internal tritone pulls strongly toward the tonic, which is why V7→I feels like 'coming home'. Also the backbone of the blues.",
  "Minor 7th": "A minor triad plus a ♭7 (1–♭3–5–♭7) — smooth, mellow and relaxed. The default 'ii' chord in jazz ii–V–I progressions.",
  "Half-diminished 7th": "A diminished triad plus a ♭7 (1–♭3–♭5–♭7) — less harsh than a full diminished 7th. It's the classic ii(ø7) leading into a minor key.",
  "Diminished 7th": "Stacked minor 3rds all the way up (1–♭3–♭5–𝄫7) — fully symmetrical and maximally tense. It can pivot to almost any key, so composers use it for dramatic modulation.",
  "Dominant 9th": "A dominant 7th extended with a 9th (1–3–5–♭7–9) — rich, funky and soulful. Think James Brown stabs; the added 9th colours the dominant tension without softening its pull.",
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
  "Major (Ionian)": "The do-re-mi major scale — bright, resolved and the reference point for all other modes. Its half-steps fall between degrees 3–4 and 7–8, and that leading tone (7→8) is what makes it feel so 'finished'.",
  "Natural Minor (Aeolian)": "The natural minor, built on the 6th degree of the major scale (A minor uses the same notes as C major). Darker than major thanks to its ♭3, ♭6 and ♭7.",
  "Dorian": "Minor with a raised 6th — jazzy and hopeful rather than sad. That bright 6th over a minor chord is the 'So What' / 'Scarborough Fair' sound.",
  "Phrygian": "Minor with a ♭2 — the lowered 2nd gives an instantly Spanish, flamenco, exotic flavour. The darkest of the common modes after Locrian.",
  "Lydian": "Major with a ♯4 — the raised 4th makes it dreamy and floating, the classic 'film score wonder' sound (think 'The Simpsons' theme).",
  "Mixolydian": "Major with a ♭7 — bright but bluesy. It's the scale that fits a dominant 7th chord, so it's everywhere in rock, funk and Celtic music.",
  "Locrian": "Both a ♭2 and a ♭5 — its tonic chord is diminished, so it can barely establish a key. The most unstable and rarely-used mode.",
  "Harmonic Minor": "Natural minor with a raised 7th, restoring the leading tone for a strong pull to the tonic. The gap between ♭6 and the raised 7th is an augmented 2nd — that exotic, Middle-Eastern leap.",
  "Melodic Minor": "Minor with a raised 6th and 7th (ascending), smoothing the awkward augmented-2nd of harmonic minor for graceful voice-leading up to the tonic. Jazz uses it in both directions.",
  "Major Pentatonic": "Five notes (1–2–3–5–6) with no half-steps, so nothing clashes — the 'no wrong notes' scale behind countless folk and pop melodies.",
  "Minor Pentatonic": "Five notes (1–♭3–4–5–♭7) — the backbone of rock, blues and pop soloing. Forgiving and instantly expressive on guitar.",
  "Blues": "Minor pentatonic plus the ♭5 'blue note' (1–♭3–4–♭5–5–♭7) — that extra chromatic passing tone is the gritty, vocal cry at the heart of the blues.",
  "Whole Tone": "Six notes all a whole step apart — perfectly symmetrical with no leading tone, so it sounds ambiguous and weightless. Debussy used it for shimmering, dreamlike colour.",
};

// --- Key signatures --------------------------------------------------------

interface MajorKey {
  name: string;
  root: number; // pitch class of the tonic
  signature: string; // the answer label
  accidentals: string; // the specific sharps/flats, correctly spelled
}

const MAJOR_KEYS: MajorKey[] = [
  { name: "C major", root: 0, signature: "none", accidentals: "no sharps or flats" },
  { name: "G major", root: 7, signature: "1 sharp", accidentals: "F♯" },
  { name: "D major", root: 2, signature: "2 sharps", accidentals: "F♯ C♯" },
  { name: "A major", root: 9, signature: "3 sharps", accidentals: "F♯ C♯ G♯" },
  { name: "E major", root: 4, signature: "4 sharps", accidentals: "F♯ C♯ G♯ D♯" },
  { name: "B major", root: 11, signature: "5 sharps", accidentals: "F♯ C♯ G♯ D♯ A♯" },
  { name: "F♯ major", root: 6, signature: "6 sharps", accidentals: "F♯ C♯ G♯ D♯ A♯ E♯" },
  { name: "F major", root: 5, signature: "1 flat", accidentals: "B♭" },
  { name: "B♭ major", root: 10, signature: "2 flats", accidentals: "B♭ E♭" },
  { name: "E♭ major", root: 3, signature: "3 flats", accidentals: "B♭ E♭ A♭" },
  { name: "A♭ major", root: 8, signature: "4 flats", accidentals: "B♭ E♭ A♭ D♭" },
  { name: "D♭ major", root: 1, signature: "5 flats", accidentals: "B♭ E♭ A♭ D♭ G♭" },
  { name: "G♭ major", root: 6, signature: "6 flats", accidentals: "B♭ E♭ A♭ D♭ G♭ C♭" },
];

const SIGNATURE_LABELS = [
  "none",
  "1 sharp",
  "2 sharps",
  "3 sharps",
  "4 sharps",
  "5 sharps",
  "6 sharps",
  "1 flat",
  "2 flats",
  "3 flats",
  "4 flats",
  "5 flats",
  "6 flats",
];

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function pick<T>(items: T[]): T {
  return items[randomInt(items.length)];
}

// Anchor generated pitches around C4 (MIDI 60) for a comfortable range.
const BASE_MIDI = 60;

export interface GeneratedQuestion {
  type: ExerciseKind;
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
    explanation: `${lo} → ${hi} is a ${name}. ${INTERVAL_INFO[name] ?? ""}`,
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

export function generateKeySignatureQuestion(): GeneratedQuestion {
  const key = pick(MAJOR_KEYS);
  const majorScale = [0, 2, 4, 5, 7, 9, 11];
  const notes = majorScale.map((i) => noteName(key.root + i));
  return {
    type: "KEY_SIGNATURE",
    prompt: `How many sharps or flats are in ${key.name}?`,
    notes,
    // Play the key's major scale so the ear connects to the answer.
    midi: [...majorScale, 12].map((i) => BASE_MIDI + key.root + i),
    correctAnswer: key.signature,
    explanation: `${key.name} has ${
      key.signature === "none" ? "no sharps or flats" : key.signature
    } (${key.accidentals}). Sharps always appear in the order F C G D A E B; flats follow the reverse, B E A D G C F.`,
    choices: withDistractors(key.signature, SIGNATURE_LABELS),
  };
}

export function generateQuestion(type: ExerciseKind): GeneratedQuestion {
  switch (type) {
    case "INTERVAL":
      return generateIntervalQuestion();
    case "CHORD_QUALITY":
      return generateChordQuestion();
    case "SCALE":
      return generateScaleQuestion();
    case "KEY_SIGNATURE":
      return generateKeySignatureQuestion();
  }
}
