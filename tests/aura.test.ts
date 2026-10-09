import { describe, expect, it } from 'vitest';
import { AuraSystem, auraRank } from '../src/game/core/aura';
describe('Aura',()=>{it('clamps negatives',()=>{const a=new AuraSystem();a.change(-20);expect(a.value).toBe(0)});it('bursts at 100 and resets to 40',()=>{const a=new AuraSystem();const r=a.change(100);expect(r.burst).toBe(true);expect(a.value).toBe(40)});it('maps ranks',()=>{expect(auraRank(75)).toBe('SIGMA');expect(auraRank(50)).toBe('ALPHA')})});
