/** Rizzler Art B3: original native 48×48 indexed pixel sheet, 28 frames. */
export const RIZZLER_B3 = {
  texture: 'spr-rizzler-b3',
  frameWidth: 48,
  frames: 28,
  tags: {
    idle: { from: 0, to: 3, ms: 175 },
    move: { from: 4, to: 9, ms: 95 },
    cast: { from: 10, to: 12, ms: 100 },
    flex_charge: { from: 13, to: 16, ms: 155 },
    flex_success: { from: 17, to: 19, ms: 115 },
    hurt: { from: 20, to: 21, ms: 90 },
    death: { from: 22, to: 27, ms: 115 },
  },
} as const;

export type RizzlerPose = keyof typeof RIZZLER_B3.tags;

/** Cast, hurt, death and FLEX success finish on their last frame; never
 * advance the actual core simulation or Rizz Aura timings here.
 */
export function rizzlerB3Frame(pose: RizzlerPose, elapsedMs: number): number {
  const tag = RIZZLER_B3.tags[pose];
  const count = tag.to - tag.from + 1;
  const index = Math.max(0, Math.floor(Math.max(0, elapsedMs) / tag.ms));
  const once = pose === 'cast' || pose === 'hurt' ||
               pose === 'death' || pose === 'flex_success';
  return tag.from + (once ? Math.min(index, count - 1) : index % count);
}
