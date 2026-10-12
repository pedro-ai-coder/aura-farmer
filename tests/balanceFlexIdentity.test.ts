import {describe,it,expect} from 'vitest';
import {Arena} from '../src/game/core/arena';
import {combatStats} from '../src/game/core/combat';
import {emptyBuffLevels} from '../src/game/data/buffs';

const foe=(a:Arena,id:number,x=a.pos.x+45,hp=500)=>{
 const enemy={id,x,y:a.pos.y,type:'beta' as const,hp,nextHit:Infinity,nextShot:Infinity};
 a.enemies.push(enemy);return enemy;
};
describe('combat balance and distinct hero FLEX identities',()=>{
 it('Cool Kid Alpha is invulnerable for the Rampage window',()=>{
  const a=new Arena(()=>.5,'cool-kid');a.start();
  a.aura.change(100);a.update(0,{flex:true});
  expect(a.flex.variant).toBe('alpha');expect(a.flexName).toBe('GIGA CHAD RAMPAGE');
  const target=foe(a,97,480);target.nextHit=0;
  a.update(10,{x:1});
  expect(a.hp).toBe(110);
  expect(a.pos.x).toBeGreaterThan(480);
 });
 it('Alpha Chad is a fortified tank, not a second invulnerable trampler',()=>{
  const a=new Arena(()=>.5,'alpha');a.start();
  a.aura.change(100);a.update(0,{flex:true});
  expect(a.flexName).toBe('UNSTOPPABLE CHAD');
  const enemy=foe(a,98,480);enemy.nextHit=0;
  a.update(10);
  expect(a.hp).toBeLessThan(120);
  expect(a.hp).toBeGreaterThan(115);
  expect(a.pos.x).toBe(480);
  expect(enemy.hp).toBeLessThan(500);
 });
 it('every weapon gains levels but diminishing growth is less explosive',()=>{
  const a=new Arena(()=>.5,'sigma');a.start();a.buffs['aura-shot']=4;
  foe(a,99,850);a.update(1);
  expect(a.shots[0].damage).toBeGreaterThan(18);
  expect(a.shots[0].damage).toBeLessThan(29);
 });
 it('stacked passives remain useful without extreme exponential damage',()=>{
  const b=emptyBuffLevels();b.sigma=2;b.alpha=2;b['locked-in']=2;b.mewing=2;
  const result=combatStats(b,100,10,9000);
  expect(result.damage).toBeCloseTo(1.2*1.2);
  expect(result.fireRate).toBe(1.32);
  expect(result.critChance).toBe(.14);
 });
});
