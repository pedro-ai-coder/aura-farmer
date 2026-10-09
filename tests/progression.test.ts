import { describe, expect, it } from 'vitest';
import { Progression, xpToNextLevel } from '../src/game/core/progression';
describe('XP',()=>{it('levels up',()=>{const p=new Progression();expect(p.gain(xpToNextLevel(1))).toBe(1);expect(p.level).toBe(2)});it('ignores negative XP',()=>{const p=new Progression();expect(p.gain(-4)).toBe(0);expect(p.xp).toBe(0)})});
