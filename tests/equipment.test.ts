import {describe,it,expect} from 'vitest';
import {Arena} from '../src/game/core/arena';
import {BUFFS,emptyBuffLevels} from '../src/game/data/buffs';
import {canEquip,equipment,isWeapon,legalUpgrades,MAX_PASSIVE_SLOTS,MAX_WEAPON_SLOTS} from '../src/game/core/equipment';

const byId=(id:string)=>BUFFS.find(b=>b.id===id)!;
describe('strict 3 weapon + 3 passive equipment',()=>{
 it('starts every hero with a visible ranged weapon and existing class bonuses',()=>{
   for(const hero of ['sigma','alpha','rizzler','ohio','fanum','six-seven','cool-kid','nerd'] as const){
     const a=new Arena(()=>.5,hero);a.start();
     expect(a.buffs['aura-shot']).toBe(1);
     expect(a.loadout.weapons).toContain('aura-shot');
     expect(a.loadout.weapons.length).toBeLessThanOrEqual(3);
     expect(a.loadout.passives.length).toBeLessThanOrEqual(3);
   }
 });
 it('blocks a fourth weapon but still allows upgrades of the three equipped weapons',()=>{
   const levels=emptyBuffLevels();
   levels['aura-shot']=1;levels['mewing-jaw']=1;levels['ohio-orbiter']=1;
   expect(equipment(levels).weapons).toHaveLength(MAX_WEAPON_SLOTS);
   expect(isWeapon('six-seven')).toBe(true);
   expect(canEquip(levels,byId('six-seven'))).toBe(false);
   expect(canEquip(levels,byId('rizz-blast'))).toBe(false);
   expect(canEquip(levels,byId('mewing-jaw'))).toBe(true);
   const offers=legalUpgrades(levels,BUFFS);
   expect(offers.some(b=>b.id==='six-seven')).toBe(false);
   expect(offers.some(b=>b.id==='mewing-jaw')).toBe(true);
 });
 it('blocks a fourth passive and never turns a passive upgrade into another slot',()=>{
   const levels=emptyBuffLevels();
   levels['aura-shot']=1;levels.drip=1;levels.speed=1;levels['thick-skin']=1;
   expect(equipment(levels).passives).toHaveLength(MAX_PASSIVE_SLOTS);
   expect(canEquip(levels,byId('sigma'))).toBe(false);
   expect(canEquip(levels,byId('drip'))).toBe(true);
 });
 it('weapon levels cap at four; passives retain their smaller maximum',()=>{
   for(const id of ['aura-shot','mewing-jaw','ohio-orbiter','six-seven','rizz-blast'] as const){
     const b=byId(id);expect(b.maxStacks).toBe(4);
     const levels=emptyBuffLevels();levels['aura-shot']=1;levels[id]=4;
     expect(canEquip(levels,b)).toBe(false);
   }
   expect(byId('drip').maxStacks).toBeLessThanOrEqual(3);
 });
 it('rejects forged fourth-slot choices inside the simulation',()=>{
   const a=new Arena(()=>.5);a.start();
   a.buffs['mewing-jaw']=1;a.buffs['ohio-orbiter']=1;
   a.mode='upgrades';a.pendingUpgrades=1;a.choices=[byId('six-seven')];
   a.update(0,{choice:0});
   expect(a.buffs['six-seven']).toBe(0);
   expect(a.loadout.weapons).toHaveLength(3);
   expect(a.choices.every(b=>b.id!=='six-seven'&&b.id!=='rizz-blast')).toBe(true);
 });
 it('weapon levels produce actual attack changes, not cosmetic cards',()=>{
   const one=new Arena(()=>.5),four=new Arena(()=>.5);
   one.start();four.start();four.buffs['aura-shot']=4;
   for(const a of [one,four])a.enemies.push({
     id:100,x:820,y:330,type:'boss',hp:10000,nextHit:Infinity,nextShot:Infinity
   });
   one.update(1);four.update(1);
   expect(four.shots[0].damage).toBeGreaterThan(one.shots[0].damage);
   expect(four.buffs['aura-shot']).toBe(4);
 });
 it('Rizz Pulse creates a short-radius damaging and slowing weapon attack',()=>{
   const a=new Arena(()=>.5,'rizzler');a.start();
   const e={id:101,x:530,y:330,type:'beta' as const,hp:500,nextHit:Infinity,nextShot:Infinity};
   a.enemies.push(e);a.update(1);
   expect(a.rizzBlastUntil).toBeGreaterThan(a.clock);
   expect(e.hp).toBeLessThan(500);
   expect(e.rizzSlowUntil).toBeGreaterThan(a.clock);
 });
 it('exhausted loadouts do not strand the player in a blank upgrade screen',()=>{
   const a=new Arena(()=>.5);a.start();
   for(const b of BUFFS)a.buffs[b.id]=b.maxStacks;
   a.mode='playing';a.pendingUpgrades=2;a.hp=20;
   a.update(1);
   expect(a.mode).toBe('playing');
   expect(a.pendingUpgrades).toBe(0);
   expect(a.choices).toEqual([]);
   expect(a.hp).toBeGreaterThan(20);
 });
});
