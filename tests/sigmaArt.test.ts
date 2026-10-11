import { describe,it,expect } from 'vitest';
import { SIGMA_B1,sigmaB1Frame } from '../src/game/render/sigmaB1';

describe('native Sigma animation frame selection',()=>{
  it('maps the 25 distinct 48px frames to stable tag ranges',()=>{
    const tags=Object.values(SIGMA_B1.tags);
    expect(tags[0].from).toBe(0);
    expect(tags.at(-1)?.to).toBe(24);
    expect(tags.reduce((n,t)=>n+t.to-t.from+1,0)).toBe(SIGMA_B1.frames);
    expect(SIGMA_B1.frameWidth).toBe(48);
    for(let i=1;i<tags.length;i++)expect(tags[i].from).toBe(tags[i-1].to+1);
  });
  it('loops idle, walking and FLEX charge with no out of bounds frames',()=>{
    expect(sigmaB1Frame('idle',0)).toBe(0);
    expect(sigmaB1Frame('idle',700)).toBe(0);
    expect(sigmaB1Frame('move',0)).toBe(4);
    expect(sigmaB1Frame('move',600)).toBe(4);
    expect(sigmaB1Frame('flex_charge',800)).toBe(13);
    for(const pose of ['idle','move','hurt','flex_charge','flex_success','death'] as const){
      for(let ms=0;ms<5000;ms+=113){
        const frame=sigmaB1Frame(pose,ms);
        expect(frame).toBeGreaterThanOrEqual(SIGMA_B1.tags[pose].from);
        expect(frame).toBeLessThanOrEqual(SIGMA_B1.tags[pose].to);
      }
    }
  });
  it('holds the last death, success and hurt frame rather than looping',()=>{
    expect(sigmaB1Frame('hurt',10000)).toBe(11);
    expect(sigmaB1Frame('flex_success',10000)).toBe(18);
    expect(sigmaB1Frame('death',10000)).toBe(24);
    expect(sigmaB1Frame('death',230)).toBe(21);
  });
});
