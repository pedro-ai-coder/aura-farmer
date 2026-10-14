import { describe, expect, it } from 'vitest';
import { Arena } from '../src/game/core/arena';
import { WORLDS, RUIN_ALLEY, getWorld, isWalkable, blocksProjectile,
  pickSpawnNearPlayer } from '../src/game/core/worldMaps';
import { selectedWorldFromQuery, validWorldId, withSelectedWorld } from '../src/game/core/worldSelection';

describe('three complete, selectable combat maps',()=>{
  it('exposes precisely three unique worlds with safe starts and solid obstacles',()=>{
    expect(WORLDS.map(m=>m.id)).toEqual(['ruin-alley','crown-chamber','toxic-rooftop']);
    const signatures=WORLDS.map(world=>world.obstacles.map(p=>p.id).join('/'));
    expect(new Set(signatures).size).toBe(3);
    for(const world of WORLDS){
      expect(world.width).toBeGreaterThan(960);
      expect(world.height).toBeGreaterThan(600);
      expect(isWalkable(world.start,19,world)).toBe(true);
      expect(world.obstacles.length).toBeGreaterThanOrEqual(9);
      const ids=world.obstacles.map(ob=>ob.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it('creates simulation in each world without changing game rules or legacy fallback',()=>{
    for(const world of WORLDS){
      expect(getWorld(world.id)).toBe(world);
      const arena=new Arena(()=>.73,'sigma',world.id);arena.start();
      expect(arena.world).toBe(world);
      expect(arena.pos).toEqual(world.start);
      expect(arena.wave).toBe(1);
      expect(arena.mode).toBe('playing');
      arena.update(100,{x:1,y:1});
      expect(isWalkable(arena.pos,19,world)).toBe(true);
    }
    const classic=new Arena(()=>.73);
    expect(classic.world).toBeNull();
  });
  it('blocks projectiles on cover and finds safe spawns for every world',()=>{
    for(const world of WORLDS){
      let seed=0;
      const random=()=>((seed++*1664525+1013904223)>>>0)/4294967296;
      for(let i=0;i<25;i++){
        const spawn=pickSpawnNearPlayer(world,world.start,18,random);
        expect(spawn).not.toBeNull();
        expect(isWalkable(spawn!,24,world)).toBe(true);
      }
      const first=world.obstacles[0];
      expect(blocksProjectile({x:first.x-30,y:first.y+first.h/2},
        {x:first.x+first.w+30,y:first.y+first.h/2},world)).toBe(true);
    }
  });
  it('accepts only known map IDs, preserves other URL options and safely falls back',()=>{
    expect(validWorldId('toxic-rooftop')).toBe(true);
    expect(validWorldId('../secrets')).toBe(false);
    expect(selectedWorldFromQuery('?map=crown-chamber')).toBe('crown-chamber');
    expect(selectedWorldFromQuery('?map=made-up')).toBe(RUIN_ALLEY.id);
    expect(withSelectedWorld('https://example.test/play?visual=cartoon#home','toxic-rooftop'))
      .toBe('/play?visual=cartoon&map=toxic-rooftop#home');
  });
});
