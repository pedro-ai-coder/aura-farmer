import { describe, expect, it } from 'vitest';
import { Arena } from '../src/game/core/arena';
import { ENEMIES } from '../src/game/data/enemies';
import {
 RUIN_ALLEY, isWalkable, moveOnMap, chaseOnMap,
 blocksProjectile, pickSpawnNearPlayer,
} from '../src/game/core/worldMaps';

describe('Ruin Alley — functional scrolling map',()=>{
 it('has a larger world and a safe spawn separate from collidable props',()=>{
   expect(RUIN_ALLEY.width).toBeGreaterThan(960);
   expect(RUIN_ALLEY.height).toBeGreaterThan(600);
   expect(RUIN_ALLEY.obstacles.length).toBeGreaterThan(6);
   expect(isWalkable(RUIN_ALLEY.start,19,RUIN_ALLEY)).toBe(true);
 });
 it('stops the player at a barrier but permits sliding beside it',()=>{
   const from={x:930,y:325};
   expect(isWalkable(from,19,RUIN_ALLEY)).toBe(true);
   const blocked=moveOnMap(from,0,-64,19,RUIN_ALLEY);
   expect(blocked).toEqual(from);
   const sliding=moveOnMap(from,30,-64,19,RUIN_ALLEY);
   expect(sliding.x).toBeGreaterThan(from.x);
   expect(sliding.y).toBe(from.y);
 });
 it('never allows an actor to cross the world perimeter',()=>{
   const p=moveOnMap({x:70,y:75},-500,-500,19,RUIN_ALLEY);
   expect(isWalkable(p,19,RUIN_ALLEY)).toBe(true);
   expect(p.x).toBe(41);expect(p.y).toBe(41);
 });
 it('provides a route around solid scenery for enemy pursuit',()=>{
   const start={x:930,y:325},target={x:930,y:100};
   const next=chaseOnMap(start,target,12,18,RUIN_ALLEY,true);
   expect(isWalkable(next,18,RUIN_ALLEY)).toBe(true);
   expect(next.x).not.toBe(start.x);
 });
 it('blocks projectiles crossing solid props, never an unobstructed shot',()=>{
   expect(blocksProjectile({x:900,y:325},{x:900,y:180},RUIN_ALLEY)).toBe(true);
   expect(blocksProjectile({x:900,y:650},{x:1100,y:650},RUIN_ALLEY)).toBe(false);
 });
 it('spawns enemies out of collision range and never inside a wall',()=>{
   let seed=1;
   const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
   for(let i=0;i<80;i++){
     const p=pickSpawnNearPlayer(RUIN_ALLEY,RUIN_ALLEY.start,ENEMIES.npc.radius,random);
     expect(p).not.toBeNull();
     expect(isWalkable(p!,ENEMIES.npc.radius+6,RUIN_ALLEY)).toBe(true);
     expect(Math.hypot(p!.x-900,p!.y-680)).toBeGreaterThanOrEqual(320);
   }
 });
 it('uses the new map in live Arena without affecting default classic bounds',()=>{
   const world=new Arena(()=>.8,'sigma','ruin-alley');
   world.start();
   expect(world.pos).toEqual(RUIN_ALLEY.start);
   for(let i=0;i<30;i++)world.update(100,{x:1});
   expect(world.pos.x).toBeGreaterThan(960);
   expect(isWalkable(world.pos,19,RUIN_ALLEY)).toBe(true);
   const classic=new Arena(()=>.8);classic.start();
   classic.pos={x:934,y:574};
   classic.update(100,{x:1,y:1});
   expect(classic.pos).toEqual({x:935,y:575});
 });
 it('retains all five waves, FLEX and the six-slot loadout in map mode',()=>{
   const a=new Arena(()=>.8,'alpha','ruin-alley');a.start();
   expect(a.world?.id).toBe('ruin-alley');
   expect(a.loadout.weapons.length).toBeLessThanOrEqual(3);
   expect(a.loadout.passives.length).toBeLessThanOrEqual(3);
   a.aura.change(100);a.update(0,{flex:true});
   expect(a.flex.state).toBe('active');
   expect(a.flex.variant).toBe('alpha');
   expect(a.flex.durationMs).toBe(5000);
 });
});
