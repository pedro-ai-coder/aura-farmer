/** Original native-resolution Sigma Art Sprint B1 frame layout (48×48). */
export const SIGMA_B1 = {
  texture: 'spr-sigma-b1',
  frameWidth: 48,
  frames: 25,
  tags: {
    idle: { from: 0, to: 3, ms: 175 },
    move: { from: 4, to: 9, ms: 100 },
    hurt: { from: 10, to: 11, ms: 90 },
    flex_charge: { from: 12, to: 15, ms: 160 },
    flex_success: { from: 16, to: 18, ms: 115 },
    death: { from: 19, to: 24, ms: 115 },
  },
} as const;

export type SigmaPose = keyof typeof SIGMA_B1.tags;

/** Time always counted from start of a pose, with stable frame boundaries. */
export function sigmaB1Frame(pose: SigmaPose, elapsedMs: number): number {
  const tag = SIGMA_B1.tags[pose];
  const count = tag.to - tag.from + 1;
  const index = Math.max(0, Math.floor(Math.max(0, elapsedMs) / tag.ms));
  return tag.from + (pose === 'death' || pose === 'hurt' || pose === 'flex_success'
    ? Math.min(index, count - 1) : index % count);
}
