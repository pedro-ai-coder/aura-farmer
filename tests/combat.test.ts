import { describe, expect, it } from 'vitest';
import { combatStats } from '../src/game/core/combat';
import { emptyBuffLevels } from '../src/game/data/buffs';
import { AuraSystem } from '../src/game/core/aura';

describe('upgrade damage and timing', () => {
  it('caps legacy damage using additive stacking instead of multiplication', () => {
    const b = emptyBuffLevels(); b.sigma = 2; b.alpha = 2;
    expect(combatStats(b, 49, 0, 0).damage).toBe(1);
    expect(combatStats(b, 50, 100, 0).damage).toBeCloseTo(1.6);
    expect(combatStats(b, 50, 3, 0).damage).toBeCloseTo(1.39);
  });
  it('activates Mewing and Locked In after 8 clean seconds, resetting after damage', () => {
    const b = emptyBuffLevels(); b.mewing = 2; b['locked-in'] = 2;
    expect(combatStats(b, 0, 0, 7999)).toMatchObject({ critChance: 0, fireRate: 1 });
    expect(combatStats(b, 0, 0, 8000)).toMatchObject({ critChance: .2, fireRate: 1.5 });
    expect(combatStats(b, 0, 0, 0)).toMatchObject({ critChance: 0, fireRate: 1 });
  });
  it('stacks speed, health and armor', () => {
    const b = emptyBuffLevels(); b.speed = 3; b['thick-skin'] = 3; b.drip = 3;
    expect(combatStats(b, 0, 0, 0)).toMatchObject({ maxHp: 115, armor: 3 });
    expect(combatStats(b, 0, 0, 0).speed).toBeCloseTo(278.8);
  });
  it('requires a manual Aura spend and preserves earned rank bonuses',()=>{
    const a=new AuraSystem();
    a.change(100,1000);
    expect(a.value).toBe(100);expect(a.attackMultiplier(6999)).toBe(1.1);
    expect(a.burstUntil).toBe(0);expect(a.bursts).toBe(0);
    expect(a.spend()).toBe(true);expect(a.value).toBe(0);
    expect(a.damageMultiplier).toBe(1.1);expect(a.bursts).toBe(1);
  });
});
