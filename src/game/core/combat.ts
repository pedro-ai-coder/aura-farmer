import { type BuffLevels } from '../data/buffs';

// Multiplicative categories; stacks within each upgrade add together.
export function combatStats(buffs: BuffLevels, aura: number, nearby: number, cleanMs: number) {
  return {
    maxHp: 100 + buffs['thick-skin'] * 20,
    speed: 205 * (1 + buffs.speed * .12),
    damage: (1 + (aura >= 50 ? buffs.sigma * .15 : 0)) * (1 + buffs.alpha * .015 * Math.min(10, nearby)),
    fireRate: 1 + (cleanMs >= 8000 ? buffs['locked-in'] * .25 : 0),
    critChance: cleanMs >= 8000 ? buffs.mewing * .1 : 0,
    armor: buffs.drip,
  };
}
