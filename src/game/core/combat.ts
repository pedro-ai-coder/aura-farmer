import { type BuffLevels } from '../data/buffs';

// Multiplicative categories; stacks within each upgrade add together.
export function combatStats(buffs: BuffLevels, aura: number, nearby: number, cleanMs: number, hp = 100 + buffs['thick-skin'] * 20, baseHp = 100) {
  const crashOut = buffs['crash-out'] > 0 && hp <= (baseHp + buffs['thick-skin'] * 20) * .35;
  return {
    maxHp: baseHp + buffs['thick-skin'] * 20,
    speed: 205 * (1 + buffs.speed * .12),
    // Additive families with a soft cap: hybrid builds still work, but no
    // multiplicative damage explosion from 3 maxed passives + 3 weapons.
    damage: Math.min(1.75,1 + (aura >= 50 ? buffs.sigma * .11 : 0) +
      buffs.alpha * .009 * Math.min(10,nearby) + (crashOut ? .26 : 0)),
    incomingDamage: crashOut ? 1.2 : 1,
    fireRate: 1 + (cleanMs >= 8000 ? buffs['locked-in'] * .18 : 0),
    critChance: cleanMs >= 8000 ? buffs.mewing * .08 : 0,
    armor: buffs.drip,
  };
}
