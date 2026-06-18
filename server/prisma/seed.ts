import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const lessons = [
  {
    slug: "what-is-tension-and-resolution",
    title: "Tension & Resolution",
    summary:
      "The heartbeat of Western harmony — how dissonance pulls toward consonance.",
    category: "FUNDAMENTALS" as const,
    order: 1,
    body: `## Tension & Resolution

Music breathes by creating **tension** and then releasing it into **resolution**.
A leading tone wants to rise to the tonic; a dominant chord wants to fall home.

- **Tension**: dissonant intervals, unstable chords (V7, vii°)
- **Resolution**: consonant intervals, stable chords (I, vi)

The name *The Resolution* is a nod to this push and pull — the moment a held
breath finally lands.`,
  },
  {
    slug: "intervals-101",
    title: "Intervals 101",
    summary: "Measuring the distance between two notes in half steps.",
    category: "INTERVALS" as const,
    order: 1,
    body: `## Intervals

An **interval** is the distance between two pitches, measured in semitones.

| Semitones | Interval |
|-----------|----------|
| 1 | Minor 2nd |
| 2 | Major 2nd |
| 3 | Minor 3rd |
| 4 | Major 3rd |
| 5 | Perfect 4th |
| 6 | Tritone |
| 7 | Perfect 5th |
| 12 | Octave |

Practice these in the **Trainer** until naming them is instant.`,
  },
  {
    slug: "diatonic-triads",
    title: "Diatonic Triads",
    summary: "The seven chords built from each degree of the major scale.",
    category: "CHORDS" as const,
    order: 1,
    body: `## Diatonic Triads

Stack thirds on each scale degree of the major scale and you get:

\`\`\`
I    ii   iii  IV   V    vi   vii°
maj  min  min  maj  maj  min  dim
\`\`\`

The qualities (major, minor, diminished) are fixed by the scale — memorize the
pattern once and it transposes to every key.`,
  },
  {
    slug: "the-circle-of-fifths",
    title: "The Circle of Fifths",
    summary: "A map of key signatures and harmonic relationships.",
    category: "HARMONY" as const,
    order: 1,
    body: `## The Circle of Fifths

Moving clockwise by perfect fifths (C → G → D → A …) adds one sharp at a time;
counter-clockwise by fourths adds flats. Neighboring keys share the most notes,
which is why progressions like ii–V–I feel so natural.`,
  },
  {
    slug: "modes-of-the-major-scale",
    title: "Modes of the Major Scale",
    summary: "Seven flavors from one parent scale.",
    category: "SCALES" as const,
    order: 1,
    body: `## Modes

Start the major scale on a different degree and you get a **mode**:

- **Ionian** (major)
- **Dorian** — minor with a raised 6th
- **Phrygian** — minor with a flat 2nd
- **Lydian** — major with a sharp 4th
- **Mixolydian** — major with a flat 7th
- **Aeolian** (natural minor)
- **Locrian** — diminished, flat 2nd & flat 5th`,
  },
  {
    slug: "seventh-chords",
    title: "Seventh Chords",
    summary: "Add a fourth note and unlock the colours of jazz and blues.",
    category: "CHORDS" as const,
    order: 2,
    body: `## Seventh Chords

Stack one more third on a triad and you get a **seventh chord**:

| Chord | Formula | Sound |
|-------|---------|-------|
| Major 7th | 1 – 3 – 5 – 7 | lush, dreamy |
| Dominant 7th | 1 – 3 – 5 – ♭7 | bluesy, wants to resolve |
| Minor 7th | 1 – ♭3 – 5 – ♭7 | smooth, mellow |
| Half-diminished | 1 – ♭3 – ♭5 – ♭7 | the ii° of minor keys |
| Diminished 7th | 1 – ♭3 – ♭5 – 𝄫7 | tense, symmetrical |

The **dominant 7th** is the engine of tension → resolution: its tritone
(between the 3rd and ♭7) pulls the ear straight home to the tonic.`,
  },
  {
    slug: "suspended-and-added-chords",
    title: "Suspended Chords",
    summary: "Replace the third and leave the ear hanging.",
    category: "CHORDS" as const,
    order: 3,
    body: `## Suspended Chords

A **sus** chord removes the 3rd — the note that makes a chord major or minor —
and replaces it with a neighbour:

- **sus2** = 1 – 2 – 5 (open, airy)
- **sus4** = 1 – 4 – 5 (tense, wants to fall to the 3rd)

Because there's no 3rd, a sus chord sounds neither happy nor sad — it floats,
unresolved, until the 3rd arrives. Pure tension and resolution.`,
  },
  {
    slug: "pentatonic-and-blues",
    title: "Pentatonic & Blues Scales",
    summary: "Five notes that never sound wrong — plus the blue note.",
    category: "SCALES" as const,
    order: 2,
    body: `## Pentatonic & Blues

The **pentatonic** scales use just five notes, dropping the half-steps that
create dissonance — which is why they're so forgiving to solo over.

- **Major pentatonic**: 1 – 2 – 3 – 5 – 6
- **Minor pentatonic**: 1 – ♭3 – 4 – 5 – ♭7

Add the **♭5 "blue note"** to the minor pentatonic and you get the **blues
scale**: 1 – ♭3 – 4 – ♭5 – 5 – ♭7 — the gritty heart of blues and rock.`,
  },
];

async function main() {
  console.log("Seeding lessons…");
  for (const lesson of lessons) {
    await prisma.lesson.upsert({
      where: { slug: lesson.slug },
      create: lesson,
      update: lesson,
    });
  }
  console.log(`Seeded ${lessons.length} lessons.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
