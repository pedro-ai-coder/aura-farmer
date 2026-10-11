import { describe,it,expect } from 'vitest';
import { ALPHA_B2, alphaB2Frame, type AlphaPose } from '../src/game/render/alphaB2';
import { Arena } from '../src/game/core/arena';

describe('Alpha Chad B2 native sprite and combat sync',()=>{
  it('defines 31 adjacent source-resolution 48px frames',()=>{
    const tags=Object.values(ALPHA_B2.tags);
    expect(ALPHA_B2.frameWidth).toBe(48);
    expect(ALPHA_B2.frames).toBe(31);
    expect(tags[0].from).toBe(0);
    expect(tags.at(-1)?.to).toBe(30);
    expect(tags.reduce((n,t)=>n+t.to-t.from+1,0)).toBe(31);
    for(let i=1;i<tags.length;i++)expect(tags[i].from).toBe(tags[i-1].to+1);
  });
  it('keeps every pose within bounds; punch runs over real 160ms strike',()=>{
    const names=Object.keys(ALPHA_B2.tags) as AlphaPose[];
    for(const name of names) {
      const tag=ALPHA_B2.tags[name];
      for(let ms=0;ms<4200;ms+=17){
        const frame=alphaB2Frame(name,ms);
        expect(frame).toBeGreaterThanOrEqual(tag.from);
        expect(frame).toBeLessThanOrEqual(tag.to);
      }
    }
    expect(alphaB2Frame('punch',0)).toBe(10);
    expect(alphaB2Frame('punch',28)).toBe(11);
    expect(alphaB2Frame('punch',155)).toBe(15);
    expect(alphaB2Frame('punch',1000)).toBe(15);
    expect(alphaB2Frame('death',10000)).toBe(30);
    expect(alphaB2Frame('idle',700)).toBe(0);
    expect(alphaB2Frame('move',570)).toBe(4);
  });
  it('preserves Alpha Chad melee starter, HP and collision stats',()=>{
    const alpha=new Arena(()=>.5,'alpha');
    alpha.start();
    expect(alpha.hp).toBe(120);
    expect(alpha.buffs['mewing-jaw']).toBe(1);
    expect(alpha.characterId).toBe('alpha');
    expect(alpha.stats.speed).toBeCloseTo(205*.92);
    const sigma=new Arena(()=>.5,'sigma');
    sigma.start();
    expect(sigma.hp).toBe(100);
  });
});
