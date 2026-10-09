import { clamp } from './math';
import { GAME } from './constants';

export type AuraRank = 'NPC' | 'COOL' | 'ALPHA' | 'SIGMA' | 'GOD AURA';
export function auraRank(value: number): AuraRank {
  if (value >= 100) return 'GOD AURA';
  if (value >= 75) return 'SIGMA';
  if (value >= 50) return 'ALPHA';
  if (value >= 25) return 'COOL';
  return 'NPC';
}
export interface AuraChange { before: number; after: number; burst: boolean }
export class AuraSystem {
  value = 0;
  bursts = 0;
  burstUntil = 0;
  change(amount: number, now = 0): AuraChange {
    const before = this.value;
    const next = clamp(before + amount, 0, 100);
    if (next >= 100) {
      this.bursts++;
      this.burstUntil = now + GAME.burstDurationMs;
      this.value = 40;
      return { before, after: this.value, burst: true };
    }
    this.value = next;
    return { before, after: this.value, burst: false };
  }
  get rank(): AuraRank { return auraRank(this.value); }
  get moveMultiplier(): number { return this.value >= 25 ? 1.05 : 1; }
  get damageMultiplier(): number { return this.value >= 50 ? 1.10 : 1; }
  attackMultiplier(now: number): number {
    return this.damageMultiplier * (now < this.burstUntil ? 1.2 : 1);
  }
  get fireRateMultiplier(): number { return this.value >= 75 ? 1.10 : 1; }
}
