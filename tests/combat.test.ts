import { describe, expect, it } from 'vitest';
import { combatStats } from '../src/game/core/combat';
import { BUFFS, emptyBuffLevels, availableBuffs } from '../src/game/data/buffs';

describe('active catalog modifiers', () => {
  it('uses current damage, speed and health passives', () => {
    const b=emptyBuffLevels(); b['gym-routine']=4; b['speed-shoes']=3; b['thick-skin']=3;
    expect(combatStats(b)).toMatchObject({maxHp:115,armor:0});
    expect(combatStats(b).damage).toBeCloseTo(1.16);
    expect(combatStats(b).speed).toBeCloseTo(205*1.12);
  });
  it('applies low-life bonuses and mitigation from equipped passives',()=>{
    const b=emptyBuffLevels(); b.berserker=2; b['iron-will']=4;
    expect(combatStats(b,35).damage).toBeCloseTo(1.2);
    expect(combatStats(b,36).damage).toBe(1);
    expect(combatStats(b).incomingDamage).toBeCloseTo(.88);
  });
  it('does not retain retired rewards or initialize their state',()=>{
    const retired=['sigma','alpha','mewing','locked-in','drip','speed','crash-out','skibidi-bounce','delulu','touch-grass','mogged','rizz-aura'];
    const levels=emptyBuffLevels();
    for(const id of retired){expect(BUFFS.some(b=>b.id===id)).toBe(false);expect(levels[id]).toBeUndefined();}
    expect(availableBuffs(levels,25).every(b=>BUFFS.includes(b))).toBe(true);
  });
});
