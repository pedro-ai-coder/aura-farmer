import {describe,expect,it} from 'vitest';
import {Arena} from '../src/game/core/arena';
import {emptyBuffLevels} from '../src/game/data/buffs';
import {combatStats} from '../src/game/core/combat';
import {ENEMIES,type EnemyType} from '../src/game/data/enemies';
import {flexStyleFor,flexDescription,waveHealthMultiplier,waveDamageMultiplier} from '../src/game/core/balance';
const game=(hero:'cool-kid'|'alpha'|'sigma'='sigma')=>{const a=new Arena(()=>.5,hero);a.start();return a;};
describe('v0.8 difficulty and FLEX identity',()=>{
 it('hybrid damage remains bounded and wave threat grows',()=>{
   const b=emptyBuffLevels();b.sigma=2;b.alpha=2;b['crash-out']=1;
   expect(combatStats(b,100,100,9000,1).damage).toBeCloseTo(1.66);
   expect(waveHealthMultiplier(1)).toBe(1);
   expect(waveHealthMultiplier(5)).toBeCloseTo(1.96);
   expect(waveDamageMultiplier(5)).toBeGreaterThan(waveDamageMultiplier(1));
 });
 it('late-wave enemies get additional HP and final boss is tougher',()=>{
   const a=game();
   const spawn=(a as unknown as {spawn:(type:EnemyType)=>void}).spawn.bind(a);
   a.wave=1;spawn('npc');const first=a.enemies.at(-1)!;
   a.wave=5;spawn('npc');const last=a.enemies.at(-1)!;
   expect(first.hp).toBe(ENEMIES.npc.hp);
   expect(last.hp).toBeGreaterThan(first.hp);
   expect(last.maxHp).toBe(last.hp);
   spawn('boss');expect(a.enemies.at(-1)!.hp).toBeGreaterThan(ENEMIES.boss.hp*2);
 });
 it('Cool Kid and Alpha Chad snapshot distinct Alpha ultimates',()=>{
   const c=game('cool-kid'),t=game('alpha');
   for(const a of [c,t]){a.aura.change(100);a.update(0,{flex:true});}
   expect(c.flex.style).toBe('alpha-rampage');
   expect(t.flex.style).toBe('alpha-bulwark');
   expect(flexStyleFor('alpha','alpha')).toBe('alpha-bulwark');
   expect(flexDescription(c.flex.style)).not.toBe(flexDescription(t.flex.style));
 });
 it('Cool Kid ignores contact while tank mitigates hits and makes pulses',()=>{
   const c=game('cool-kid'),t=game('alpha');
   for(const a of [c,t]){
     a.aura.change(100);a.update(0,{flex:true});
     a.enemies.push({id:99,type:'beta',x:a.pos.x,y:a.pos.y,hp:1000,nextHit:0,nextShot:Infinity});
   }
   const cHp=c.hp,tHp=t.hp;
   c.update(50);t.update(50);
   expect(c.hp).toBe(cHp);
   expect(t.hp).toBeLessThan(tHp);
   expect(t.hp).toBeGreaterThan(tHp-5);
   expect(t.bulwarkPulseUntil).toBeGreaterThan(t.clock);
   expect(t.enemies[0].hp).toBeLessThan(1000);
 });
 it('inter-wave healing is limited to 10% of max HP',()=>{
   const a=game();a.hp=40;a.waveClock=50000;
   a.update(1);expect(a.mode).toBe('between');
   a.update(0,{confirm:true});
   expect(a.hp).toBe(50);
 });
 it('wave bosses do not get deleted by Alpha shockwaves and charge is spent',()=>{
   const a=game('alpha');a.wave=5;a.aura.change(100);a.update(0,{flex:true});
   a.enemies.push({id:301,type:'boss',x:a.pos.x,y:a.pos.y,
     hp:2000,maxHp:2000,nextHit:Infinity,nextShot:Infinity});
   a.update(200);
   expect(a.enemies[0].hp).toBeGreaterThan(1900);
   expect(a.aura.value).toBe(0);
   a.update(0,{flex:true});expect(a.flexSuccesses).toBe(1);
 });
});
