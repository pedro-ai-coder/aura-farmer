import { type BuffLevels } from '../data/buffs';

/** Live Combat V2 passive modifiers. Clamp stacked bonuses before weapon scaling. */
export function combatStats(buffs: BuffLevels, aura: number, nearby: number, cleanMs: number, hp = 100, baseHp = 100) {
  const maxHp = Math.round(baseHp * (1 + (buffs['thick-skin'] ?? 0)*.05));
  const lowHp = hp <= maxHp*.35;
  const crashOut = buffs['crash-out']>0 && lowHp;
  const bonusDamage =
    (aura>=50?(buffs.sigma??0)*.15:0) +
    (buffs.alpha??0)*.015*Math.min(10,nearby) +
    (crashOut?.4:0) +
    (buffs['gym-routine']??0)*.04 +
    (lowHp ? (buffs.berserker===2?.20:buffs.berserker===1?.12:0) : 0);
  const speedBonus=(buffs.speed??0)*.12+(buffs['speed-shoes']??0)*.04+
    (lowHp?(buffs.adrenaline??0)*.04+((buffs.adrenaline??0)>0?.04:0):0);
  const fireBonus=(cleanMs>=8000?(buffs['locked-in']??0)*.25:0) +
    (buffs['quick-hands']??0)*.03 + (buffs['cardio-king']??0)*.03;
  const damageReduction=Math.min(.35,(buffs['iron-will']??0)*.03);
  return {
    maxHp,
    speed:205*(1+Math.min(.8,speedBonus)),
    damage:1+Math.min(.75,bonusDamage),
    incomingDamage:(crashOut?1.2:1)*(1-damageReduction),
    fireRate:1+Math.min(1/.65-1,fireBonus),
    critChance:Math.min(.5,(cleanMs>=8000?(buffs.mewing??0)*.1:0)
      +(buffs['lucky-charm']??0)*.02+(buffs['critical-drip']??0)*.07),
    armor:buffs.drip??0,
  };
}
