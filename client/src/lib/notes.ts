// Pitch-class note names (sharps) for display on the client.
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

export function noteName(midiOrPitchClass: number): string {
  return NOTE_NAMES[((midiOrPitchClass % 12) + 12) % 12];
}
