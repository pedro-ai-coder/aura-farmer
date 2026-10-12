import { type BuffLevels } from '../data/buffs';

// Multiplicative categories; stacks within each upgrade add together.
export function combatStats(buffs: BuffLevels, aura: number, nearby: number, cleanMs: number, hp = 100 + buffs['thick-skin'] * 20, baseHp = 100) {
  const crashOut = buffs['crash-out'] > 0 && hp <= (baseHp + buffs['thick-skin'] * 20) * .35;
  return {
    maxHp: baseHp + buffs['thick-skin'] * 20,
    speed: 205 * (1 + Math.min(3,buffs.speed) * .08),
    damage: (1 + (aura >= 50 ? Math.min(3,buffs.sigma) * .08 : 0)) * (1 + Math.min(3,buffs.alpha) * .012 * Math.min(6, nearby)) * (crashOut ? 1.25 : 1),
    incomingDamage: crashOut ? 1.2 : 1,
    fireRate: 1 + (cleanMs >= 8000 ? Math.min(3,buffs['locked-in']) * .12 : 0),
    critChance: cleanMs >= 8000 ? Math.min(3,buffs.mewing) * .06 : 0,
    armor: Math.min(3,buffs.drip),
  };
}
