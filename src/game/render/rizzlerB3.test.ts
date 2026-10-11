import { describe, expect, it } from 'vitest';
import { RIZZLER_B3, rizzlerB3Frame } from './rizzlerB3';

describe('Rizzler B3 native atlas', () => {
  it('has 28 contiguous 48px frames for all seven states', () => {
    let next = 0;
    for (const tag of Object.values(RIZZLER_B3.tags)) {
      expect(tag.from).toBe(next);
      expect(tag.to).toBeGreaterThanOrEqual(tag.from);
      next = tag.to + 1;
    }
    expect(next).toBe(28);
    expect(RIZZLER_B3.frameWidth).toBe(48);
  });
  it('cycles idle and movement, but holds completed one-shot casts and death', () => {
    expect(rizzlerB3Frame('idle', 0)).toBe(0);
    expect(rizzlerB3Frame('idle', 4 * 175)).toBe(0);
    expect(rizzlerB3Frame('move', 95)).toBe(5);
    expect(rizzlerB3Frame('cast', 999)).toBe(12);
    expect(rizzlerB3Frame('death', 9999)).toBe(27);
    expect(rizzlerB3Frame('hurt', -500)).toBe(20);
  });
});
