// One color per die face (1..6), shared by Die and every chart so a face has
// the same color everywhere. Values mirror the --face-N CSS tokens.
export const FACE_COLORS: Record<number, string> = {
  1: 'var(--face-1)',
  2: 'var(--face-2)',
  3: 'var(--face-3)',
  4: 'var(--face-4)',
  5: 'var(--face-5)',
  6: 'var(--face-6)',
}
