import { describe, expect, it } from 'vitest';
import { combatStats } from '../src/game/core/combat';
import { emptyBuffLevels } from '../src/game/data/buffs';
import { AuraSystem } from '../src/game/core/aura';

describe('upgrade damage and timing', () => {
  it('applies Sigma only with 50 Aura and caps Alpha at ten nearby enemies', () => {
    const b = emptyBuffLevels(); b.sigma = 2; b.alpha = 2;
    expect(combatStats(b, 49, 0, 0).damage).toBe(1);
    expect(combatStats(b, 50, 100, 0).damage).toBeCloseTo(1.3 * 1.3);
    expect(combatStats(b, 50, 3, 0).damage).toBeCloseTo(1.3 * 1.09);
  });
  it('activates Mewing and Locked In after 8 clean seconds, resetting after damage', () => {
    const b = emptyBuffLevels(); b.mewing = 2; b['locked-in'] = 2;
    expect(combatStats(b, 0, 0, 7999)).toMatchObject({ critChance: 0, fireRate: 1 });
    expect(combatStats(b, 0, 0, 8000)).toMatchObject({ critChance: .2, fireRate: 1.5 });
    expect(combatStats(b, 0, 0, 0)).toMatchObject({ critChance: 0, fireRate: 1 });
  });
  it('stacks speed, health and armor', () => {
    const b = emptyBuffLevels(); b.speed = 3; b['thick-skin'] = 3; b.drip = 3;
    expect(combatStats(b, 0, 0, 0)).toMatchObject({ maxHp: 160, armor: 3 });
    expect(combatStats(b, 0, 0, 0).speed).toBeCloseTo(278.8);
  });
  it('grants a six-second Burst independently of ranks and refreshes on a new burst', () => {
    const a = new AuraSystem(); a.change(100, 1000);
    expect(a.value).toBe(40); expect(a.attackMultiplier(6999)).toBe(1.2); expect(a.attackMultiplier(7000)).toBe(1);
    a.change(10, 2000); expect(a.attackMultiplier(2000)).toBeCloseTo(1.32);
    a.change(50, 3000); expect(a.burstUntil).toBe(9000); expect(a.bursts).toBe(2);
  });
});
