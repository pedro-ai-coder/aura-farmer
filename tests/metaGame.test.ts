import { describe, expect, it } from 'vitest';
import { Arena } from '../src/game/core/arena';
import { CHARACTERS } from '../src/game/data/characters';
import { ACHIEVEMENTS, newProfile, recordRun, runResult, personalBest, type RunResult } from '../src/meta/profile';

describe('character roster and game progression', () => {
  it('has six valid distinct characters with four starters', () => {
    expect(CHARACTERS).toHaveLength(6);
    expect(new Set(CHARACTERS.map(c=>c.id)).size).toBe(6);
    const starters=CHARACTERS.filter(c=>!c.unlockedBy);
    expect(starters).toHaveLength(4);
  });
  it('preserves Sigma balance and lets all characters complete a fresh run', () => {
    const sigma=new Arena(()=>.5); sigma.update(0,{confirm:true});
    expect(sigma.hp).toBe(100);expect(sigma.stats.speed).toBe(205);
    for(const c of CHARACTERS) {
      const a=new Arena(()=>.5,c.id); a.update(0,{confirm:true});
      expect(a.mode).toBe('playing');expect(a.characterId).toBe(c.id);
      expect(a.hp).toBeGreaterThan(0);
      expect(a.stats.speed).toBeGreaterThan(0);
    }
  });
  it('each loadout has real combat differences and replay keeps character', () => {
    const alpha=new Arena(()=>.5,'alpha');alpha.start();expect(alpha.hp).toBe(120);
    expect(alpha.buffs['mewing-jaw']).toBe(1);
    const rizz=new Arena(()=>.5,'rizzler');rizz.start();expect(rizz.buffs['rizz-aura']).toBe(1);
    const ohio=new Arena(()=>.5,'ohio');ohio.start();expect(ohio.hp).toBe(75);
    expect(ohio.stats.speed).toBeGreaterThan(alpha.stats.speed);
    expect(ohio.stats.critChance).toBeCloseTo(.05);
    const fanum=new Arena(()=>.5,'fanum');fanum.start();
    fanum.drops.push({ ...fanum.pos, xp:8 });fanum.update(1);
    expect(fanum.xpCollected).toBe(10);
    const six=new Arena(()=>.5,'six-seven');six.start();
    expect(six.buffs['six-seven']).toBe(1);
    alpha.hp=1;alpha.mode='dead';alpha.update(0,{confirm:true});
    expect(alpha.characterId).toBe('alpha');expect(alpha.hp).toBe(120);
  });
  it('records runs and achievements once, and handles cumulative unlocks', () => {
    expect(ACHIEVEMENTS).toHaveLength(12);
    const a=new Arena(()=>.5,'sigma');a.start();
    a.kills=67;a.xpCollected=500;a.flexSuccesses=3;a.auraBursts=10;
    a.ultimate67Triggered=true;a.mode='win';a.wave=5;
    const result=runResult(a);
    const first=recordRun(newProfile(),result);
    expect(first.profile.achievements).toContain('first-win');
    expect(first.profile.achievements).toContain('flex3');
    expect(first.profile.achievements).toContain('loot500');
    expect(first.unlocked).toEqual(expect.arrayContaining(['fanum','six-seven']));
    expect(first.profile.runHistory).toHaveLength(1);
    expect(recordRun(first.profile,result).profile.runHistory).toHaveLength(1);
    expect(personalBest(first.profile)?.score).toBe(result.score);
    const loss:RunResult={...result,id:'other',won:false,kills:0,score:3};
    const second=recordRun(first.profile,loss);
    expect(personalBest(second.profile)?.score).toBe(result.score);
  });
});
