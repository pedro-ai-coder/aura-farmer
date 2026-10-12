import {describe,expect,it} from 'vitest';
import {AuraSystem,auraRank} from '../src/game/core/aura';
describe('Aura FLEX charge',()=>{
  it('clamps negatives and maintains earned Aura rank bonus after activation',()=>{
    const a=new AuraSystem();a.change(-20);expect(a.value).toBe(0);
    a.change(75);expect(a.rank).toBe('SIGMA');
    a.change(25);expect(a.value).toBe(100);
    expect(a.spend()).toBe(true);expect(a.value).toBe(0);
    expect(a.rank).toBe('GOD AURA');expect(a.fireRateMultiplier).toBeCloseTo(1.1);
  });
  it('holds at 100 without automatic Burst, and requires manual spend',()=>{
    const a=new AuraSystem();const r=a.change(130,100);
    expect(r.burst).toBe(false);expect(a.value).toBe(100);
    expect(a.burstUntil).toBe(0);expect(a.bursts).toBe(0);
    expect(a.spend()).toBe(true);expect(a.bursts).toBe(1);
    expect(a.spend()).toBe(false);
  });
  it('retains original Aura rank ordering',()=>{
    expect(auraRank(75)).toBe('SIGMA');expect(auraRank(50)).toBe('ALPHA');
  });
});
