import { type BuffLevels } from '../data/buffs';

// Multiplicative categories; stacks within each upgrade add together.
export function combatStats(buffs: BuffLevels, aura: number, nearby: number, cleanMs: number, hp = 100 + buffs['thick-skin'] * 20, baseHp = 100) {
  const crashOut = buffs['crash-out'] > 0 && hp <= (baseHp + buffs['thick-skin'] * 20) * .35;
  return {
    maxHp: baseHp + buffs['thick-skin'] * 20,
    speed: 205 * (1 + buffs.speed * .12),
    damage: (1 + (aura >= 50 ? buffs.sigma * .15 : 0)) * (1 + buffs.alpha * .015 * Math.min(10, nearby)) * (crashOut ? 1.4 : 1),
    incomingDamage: crashOut ? 1.2 : 1,
    fireRate: 1 + (cleanMs >= 8000 ? buffs['locked-in'] * .25 : 0),
    critChance: cleanMs >= 8000 ? buffs.mewing * .1 : 0,
    armor: buffs.drip,
  };
}
