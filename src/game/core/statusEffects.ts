import type { Vec2 } from './math';

export interface BuffTarget extends Vec2 { id: number; hp: number; rizzSlowUntil?: number }
/** Slow used by the current Rizz weapon and Flex, with reduced boss impact. */
export function rizzSpeed(enemy: BuffTarget, isBoss: boolean, now: number): number {
  return now < (enemy.rizzSlowUntil ?? 0) ? (isBoss ? .85 : .75) : 1;
}
