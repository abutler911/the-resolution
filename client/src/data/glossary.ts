// Music theory glossary. Static reference content — searched instantly on the
// client. `aliases` widen search hits (e.g. "half step" finds "Semitone").

export type GlossaryCategory =
  | "Fundamentals"
  | "Notation"
  | "Intervals"
  | "Chords"
  | "Scales & Modes"
  | "Harmony"
  | "Rhythm";

export interface GlossaryTerm {
  term: string;
  aliases?: string[];
  category: GlossaryCategory;
  definition: string;
  related?: string[];
}

export const GLOSSARY: GlossaryTerm[] = [
  // --- Fundamentals -------------------------------------------------------
  {
    term: "Pitch",
    category: "Fundamentals",
    definition:
      "How high or low a note sounds, determined by its frequency (measured in hertz). Doubling the frequency raises the pitch by exactly one octave.",
    related: ["Octave", "Register"],
  },
  {
    term: "Semitone",
    aliases: ["half step", "half-step", "halftone"],
    category: "Fundamentals",
    definition:
      "The smallest interval in standard Western music — the distance between two adjacent keys on a piano, such as E to F, or C to C♯. Twelve equal semitones make up an octave. Also called a half step.",
    related: ["Tone", "Interval", "Octave", "Chromatic"],
  },
  {
    term: "Tone",
    aliases: ["whole step", "whole tone", "whole-step"],
    category: "Fundamentals",
    definition:
      "An interval of two semitones, such as C to D — also called a whole step. Most scale steps in the major and minor scales are tones rather than semitones.",
    related: ["Semitone", "Major scale"],
  },
  {
    term: "Octave",
    category: "Fundamentals",
    definition:
      "The interval between a note and the next note of the same name, twelve semitones higher or lower. The two pitches sound so alike the ear treats them as 'the same note' in different registers, because the higher one is exactly double the frequency.",
    related: ["Pitch", "Interval", "Semitone"],
  },
  {
    term: "Interval",
    category: "Intervals",
    definition:
      "The distance in pitch between two notes, named by a number (the count of letter names) and a quality (perfect, major, minor, augmented, or diminished) — for example a 'minor 3rd' or 'perfect 5th'. Intervals are the raw material of melody and harmony.",
    related: ["Semitone", "Consonance", "Inversion", "Tritone"],
  },
  {
    term: "Consonance",
    category: "Fundamentals",
    definition:
      "A combination of notes that sounds stable, smooth and at rest — such as an octave, perfect 5th, or major 3rd. Music creates motion by moving between consonance and dissonance.",
    related: ["Dissonance", "Resolution", "Interval"],
  },
  {
    term: "Dissonance",
    category: "Fundamentals",
    definition:
      "A combination of notes that sounds tense, clashing or unstable — such as a minor 2nd or a tritone — and which the ear wants to resolve to consonance. Dissonance is the 'tension' half of tension and resolution.",
    related: ["Consonance", "Tension", "Resolution", "Tritone"],
  },
  {
    term: "Enharmonic",
    category: "Notation",
    definition:
      "Two names for the same pitch — for example C♯ and D♭ are the same key on a piano but spelled differently depending on the musical context. Choosing the right enharmonic spelling keeps notation readable.",
    related: ["Sharp", "Flat", "Accidental"],
  },
  {
    term: "Register",
    category: "Fundamentals",
    definition:
      "The general height of a pitch or range — low, middle, or high. The same note played in a higher register sounds brighter and thinner; lower, it sounds darker and fuller.",
    related: ["Pitch", "Octave"],
  },

  // --- Notation -----------------------------------------------------------
  {
    term: "Sharp",
    category: "Notation",
    definition:
      "The symbol ♯, which raises a note by one semitone. F♯ is one semitone above F.",
    related: ["Flat", "Natural", "Accidental", "Key signature"],
  },
  {
    term: "Flat",
    category: "Notation",
    definition:
      "The symbol ♭, which lowers a note by one semitone. B♭ is one semitone below B.",
    related: ["Sharp", "Natural", "Accidental", "Key signature"],
  },
  {
    term: "Natural",
    category: "Notation",
    definition:
      "The symbol ♮, which cancels a previous sharp or flat and returns a note to its un-altered pitch.",
    related: ["Sharp", "Flat", "Accidental"],
  },
  {
    term: "Accidental",
    category: "Notation",
    definition:
      "A sharp, flat, or natural sign that temporarily alters a note's pitch within a bar, outside of what the key signature specifies.",
    related: ["Sharp", "Flat", "Natural", "Key signature"],
  },
  {
    term: "Key signature",
    category: "Notation",
    definition:
      "The set of sharps or flats placed at the start of each staff line, defining the key and telling the player which notes are altered throughout the piece. C major has none; each step around the circle of fifths adds one sharp or flat.",
    related: ["Key", "Circle of fifths", "Accidental"],
  },

  // --- Intervals ----------------------------------------------------------
  {
    term: "Tritone",
    aliases: ["augmented 4th", "diminished 5th", "devil's interval"],
    category: "Intervals",
    definition:
      "An interval of six semitones — exactly half an octave, and the most dissonant interval. Historically nicknamed 'diabolus in musica' (the devil in music), its instability is what drives a dominant 7th chord to resolve.",
    related: ["Dissonance", "Dominant", "Interval"],
  },
  {
    term: "Inversion",
    category: "Intervals",
    definition:
      "Flipping an interval or chord. For an interval, move the lower note up an octave: a major 3rd inverts to a minor 6th, and the two always add up to nine. For a chord, it means putting a note other than the root in the bass.",
    related: ["Interval", "Chord", "Root"],
  },
  {
    term: "Compound interval",
    category: "Intervals",
    definition:
      "An interval larger than an octave, such as a 9th (an octave plus a 2nd) or a 13th (an octave plus a 6th). Extended chords are built from compound intervals.",
    related: ["Interval", "Octave", "Extension"],
  },

  // --- Chords -------------------------------------------------------------
  {
    term: "Chord",
    category: "Chords",
    definition:
      "Three or more notes sounded together. Most Western chords are built by stacking thirds on a root note, producing triads, seventh chords, and richer extensions.",
    related: ["Triad", "Root", "Seventh chord", "Arpeggio"],
  },
  {
    term: "Triad",
    category: "Chords",
    definition:
      "A three-note chord built from a root, a third, and a fifth. The quality of the thirds gives the four triad types: major, minor, diminished, and augmented.",
    related: ["Chord", "Root", "Third", "Fifth"],
  },
  {
    term: "Root",
    category: "Chords",
    definition:
      "The note a chord is built on and named after — the C in a C major chord. When the root is the lowest note, the chord is in 'root position'.",
    related: ["Chord", "Triad", "Inversion"],
  },
  {
    term: "Third",
    category: "Chords",
    definition:
      "The note a third above the root of a chord. A major third (4 semitones) makes the chord major; a minor third (3 semitones) makes it minor — so the third decides the chord's basic mood.",
    related: ["Triad", "Root", "Fifth"],
  },
  {
    term: "Fifth",
    category: "Chords",
    definition:
      "The note a fifth above the root, usually a perfect 5th. Lowering it gives a diminished chord; raising it gives an augmented chord. The fifth adds stability and power.",
    related: ["Triad", "Root", "Third", "Perfect 5th"],
  },
  {
    term: "Seventh chord",
    category: "Chords",
    definition:
      "A four-note chord — a triad with another third stacked on top, adding the seventh. Types include major 7th, dominant 7th, minor 7th, and diminished 7th, each with its own colour. The harmonic heart of jazz and blues.",
    related: ["Triad", "Chord", "Dominant", "Extension"],
  },
  {
    term: "Extension",
    aliases: ["9th", "11th", "13th", "extended chord"],
    category: "Chords",
    definition:
      "A note added above the seventh of a chord — the 9th, 11th, or 13th — to enrich its colour. Extensions are compound intervals and are common in jazz and soul voicings.",
    related: ["Seventh chord", "Compound interval", "Voicing"],
  },
  {
    term: "Arpeggio",
    aliases: ["broken chord"],
    category: "Chords",
    definition:
      "The notes of a chord played one after another rather than simultaneously — a 'broken chord'. Arpeggios outline harmony melodically.",
    related: ["Chord", "Triad"],
  },
  {
    term: "Voicing",
    category: "Chords",
    definition:
      "The specific arrangement of a chord's notes — which octave each is in, their order, and any doublings or omissions. The same chord can be voiced countless ways, each with a different feel.",
    related: ["Chord", "Inversion", "Extension"],
  },

  // --- Scales & Modes -----------------------------------------------------
  {
    term: "Scale",
    category: "Scales & Modes",
    definition:
      "An ordered sequence of notes ascending or descending within an octave, defined by its pattern of tones and semitones. Scales provide the palette of notes a melody and its harmony draw from.",
    related: ["Mode", "Major scale", "Minor scale", "Scale degree"],
  },
  {
    term: "Mode",
    category: "Scales & Modes",
    definition:
      "A scale produced by starting the major scale on a different degree — giving seven modes (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian). Each has its own characteristic note and mood.",
    related: ["Scale", "Diatonic", "Major scale"],
  },
  {
    term: "Diatonic",
    category: "Scales & Modes",
    definition:
      "Belonging to the seven notes of a given key or scale. A 'diatonic chord' uses only those notes; the opposite is chromatic, which borrows notes from outside the key.",
    related: ["Chromatic", "Scale", "Key"],
  },
  {
    term: "Chromatic",
    category: "Scales & Modes",
    definition:
      "Using pitches from outside the current key, or moving by semitones. The chromatic scale is all twelve semitones in an octave.",
    related: ["Diatonic", "Semitone", "Scale"],
  },
  {
    term: "Pentatonic",
    category: "Scales & Modes",
    definition:
      "A five-note scale. The major and minor pentatonics remove the half-steps of the full scale, so nothing clashes — making them the forgiving 'no wrong notes' scales behind folk, rock, and blues.",
    related: ["Scale", "Blues note"],
  },
  {
    term: "Scale degree",
    aliases: ["tonic", "supertonic", "mediant", "dominant", "leading tone"],
    category: "Scales & Modes",
    definition:
      "The numbered position of a note within a scale (1st through 7th), each with a name: tonic (1), supertonic (2), mediant (3), subdominant (4), dominant (5), submediant (6), and leading tone (7).",
    related: ["Tonic", "Dominant", "Leading tone", "Scale"],
  },
  {
    term: "Leading tone",
    category: "Scales & Modes",
    definition:
      "The 7th degree of a major scale, one semitone below the tonic. Its strong pull up to the tonic is a key source of resolution; the minor scale often raises its 7th to create one.",
    related: ["Tonic", "Resolution", "Scale degree"],
  },
  {
    term: "Major scale",
    category: "Scales & Modes",
    definition:
      "The seven-note scale following the step pattern W–W–H–W–W–W–H (tone/semitone). Bright and resolved, it's the reference scale all modes and key signatures are derived from.",
    related: ["Scale", "Mode", "Minor scale"],
  },
  {
    term: "Minor scale",
    category: "Scales & Modes",
    definition:
      "A scale with a lowered 3rd (and usually 6th and 7th), giving a darker sound. It comes in three forms: natural, harmonic (raised 7th), and melodic (raised 6th and 7th ascending).",
    related: ["Major scale", "Scale", "Relative major/minor"],
  },

  // --- Harmony ------------------------------------------------------------
  {
    term: "Tonic",
    aliases: ["home note", "key center"],
    category: "Harmony",
    definition:
      "The first degree of a scale and the harmonic 'home' of a key — the note and chord that feel most stable and where music tends to come to rest. The key of C major has C as its tonic.",
    related: ["Dominant", "Key", "Resolution", "Scale degree"],
  },
  {
    term: "Dominant",
    category: "Harmony",
    definition:
      "The fifth degree of a scale, and the chord built on it (V). The dominant chord — especially as a dominant 7th — creates strong tension that resolves to the tonic, the most important cadence in tonal music.",
    related: ["Tonic", "Subdominant", "Cadence", "Tritone"],
  },
  {
    term: "Subdominant",
    category: "Harmony",
    definition:
      "The fourth degree of a scale and the chord built on it (IV). It moves away from the tonic and often sets up the dominant, as in the I–IV–V progression.",
    related: ["Tonic", "Dominant", "Progression"],
  },
  {
    term: "Cadence",
    category: "Harmony",
    definition:
      "A chord progression that ends a musical phrase, like punctuation. A perfect cadence (V–I) sounds conclusive; a plagal cadence (IV–I) is the 'Amen'; an imperfect or interrupted cadence leaves things open.",
    related: ["Dominant", "Tonic", "Resolution", "Progression"],
  },
  {
    term: "Resolution",
    category: "Harmony",
    definition:
      "The moment a dissonant or unstable sound moves to a stable, consonant one — tension releasing into rest. It's what the app is named for: the satisfying arrival home, as when a dominant chord falls to the tonic.",
    related: ["Tension", "Cadence", "Consonance", "Dominant"],
  },
  {
    term: "Tension",
    category: "Harmony",
    definition:
      "The sense of instability or 'wanting to move' created by dissonance, unstable chords, or notes away from the tonic. Music breathes by building tension and then releasing it through resolution.",
    related: ["Resolution", "Dissonance", "Dominant"],
  },
  {
    term: "Progression",
    aliases: ["chord progression"],
    category: "Harmony",
    definition:
      "A sequence of chords forming the harmonic backbone of a passage, often written in Roman numerals (e.g. I–V–vi–IV). Progressions create movement through tension and resolution.",
    related: ["Cadence", "Diatonic", "Functional harmony"],
  },
  {
    term: "Circle of fifths",
    category: "Harmony",
    definition:
      "A diagram arranging the twelve keys in a circle by perfect fifths. Moving clockwise adds a sharp each step; counter-clockwise adds a flat. Neighbouring keys share the most notes, which is why nearby chords flow naturally.",
    related: ["Key", "Key signature", "Dominant"],
  },
  {
    term: "Key",
    category: "Harmony",
    definition:
      "The group of pitches a piece is centred on, defined by its tonic and scale (e.g. 'A minor'). The key determines which notes sound 'in' and which sound chromatic.",
    related: ["Tonic", "Key signature", "Modulation", "Diatonic"],
  },
  {
    term: "Modulation",
    aliases: ["key change"],
    category: "Harmony",
    definition:
      "Changing key within a piece of music. Smooth modulations usually move to closely related keys (neighbours on the circle of fifths), often pivoting through a chord the two keys share.",
    related: ["Key", "Circle of fifths"],
  },
  {
    term: "Relative major/minor",
    aliases: ["relative key"],
    category: "Harmony",
    definition:
      "A major and minor key that share the same key signature and notes — C major and A minor, for example. The minor's tonic sits a minor 3rd below the major's.",
    related: ["Key", "Minor scale", "Key signature"],
  },
  {
    term: "Functional harmony",
    category: "Harmony",
    definition:
      "The system where chords play roles — tonic (rest), subdominant (departure), and dominant (tension) — and progress in patterns the ear expects. It underpins most Western classical and popular music.",
    related: ["Tonic", "Dominant", "Subdominant", "Progression"],
  },

  // --- Rhythm -------------------------------------------------------------
  {
    term: "Tempo",
    category: "Rhythm",
    definition:
      "The speed of the beat, measured in beats per minute (BPM) or described with Italian terms like Adagio (slow) or Allegro (fast).",
    related: ["Beat", "Time signature"],
  },
  {
    term: "Beat",
    category: "Rhythm",
    definition:
      "The steady underlying pulse of music — what you tap your foot to. Beats group into bars according to the time signature.",
    related: ["Tempo", "Time signature", "Syncopation"],
  },
  {
    term: "Time signature",
    aliases: ["meter", "metre"],
    category: "Rhythm",
    definition:
      "The two stacked numbers at the start of a piece showing how beats are grouped: the top number is beats per bar, the bottom the note value of one beat. 4/4 means four quarter-note beats per bar.",
    related: ["Beat", "Tempo"],
  },
  {
    term: "Syncopation",
    category: "Rhythm",
    definition:
      "Placing accents on the off-beats or weak parts of a bar, against the expected pulse. It's the rhythmic surprise that gives funk, jazz, and Latin music their groove.",
    related: ["Beat", "Tempo"],
  },
];
