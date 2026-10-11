/** Art Sprint B2 native 48×48 Alpha Chad sprite atlas: 31 original pixel frames.
 * All poses share the same in-game center/pivot and do not change hitboxes.
 */
export const ALPHA_B2 = {
  texture: 'spr-alpha-b2',
  frameWidth: 48,
  frames: 31,
  tags: {
    idle: { from: 0, to: 3, ms: 175 },
    move: { from: 4, to: 9, ms: 95 },
    punch: { from: 10, to: 15, ms: 28 },
    flex_charge: { from: 16, to: 19, ms: 155 },
    flex_success: { from: 20, to: 22, ms: 115 },
    hurt: { from: 23, to: 24, ms: 90 },
    death: { from: 25, to: 30, ms: 115 },
  },
} as const;

export type AlphaPose = keyof typeof ALPHA_B2.tags;

/** Choose stable frames; attacks, hurt, death and FLEX success hold their
 * final pose rather than looping. Idle/walk/FLEX charging cycle continuously.
 */
export function alphaB2Frame(pose: AlphaPose, elapsedMs: number): number {
  const tag = ALPHA_B2.tags[pose];
  const count = tag.to - tag.from + 1;
  const index = Math.max(0, Math.floor(Math.max(0, elapsedMs) / tag.ms));
  const once = pose === 'punch' || pose === 'hurt' || pose === 'death' || pose === 'flex_success';
  return tag.from + (once ? Math.min(index, count - 1) : index % count);
}
