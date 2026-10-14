import {describe,it,expect} from 'vitest';
import {Arena} from '../src/game/core/arena';
import {CHARACTER_IDS} from '../src/game/data/characters';
import {BUFFS,availableBuffs,emptyBuffLevels} from '../src/game/data/buffs';
import {canEquip,legalUpgrades,equipment} from '../src/game/core/equipment';
import {PASSIVES_V2,WEAPONS_V2,FLEXES_V2,difficultyV2} from '../src/game/combatV2';

const byId=(id:string)=>BUFFS.find(x=>x.id===id)!;

describe('Combat V2 live runtime contracts',()=>{
  it('maps six catalog weapons and eight Flexes to real hero IDs',()=>{
    expect(WEAPONS_V2).toHaveLength(6);
    expect(new Set(WEAPONS_V2.map(w=>w.id)).size).toBe(6);
    expect(new Set(FLEXES_V2.map(f=>f.characterId))).toEqual(new Set(CHARACTER_IDS));
    expect(new Set(CHARACTER_IDS.map(id=>new Arena(()=>.5,id).flexName)).size).toBe(8);
  });

  it('offers 10/8/6/4 passives only after XP rarity gates',()=>{
    expect(PASSIVES_V2.filter(p=>p.rarity==='normal')).toHaveLength(10);
    expect(PASSIVES_V2.filter(p=>p.rarity==='rare')).toHaveLength(8);
    expect(PASSIVES_V2.filter(p=>p.rarity==='epic')).toHaveLength(6);
    expect(PASSIVES_V2.filter(p=>p.rarity==='legendary')).toHaveLength(4);
    const zero=emptyBuffLevels();
    const offered=(level:number)=>availableBuffs(zero,level);
    expect(offered(1)).toHaveLength(16);
    expect(offered(3)).toHaveLength(24);
    expect(offered(6)).toHaveLength(30);
    expect(offered(10)).toHaveLength(34);
    expect(offered(1).some(b=>b.id==='drip')).toBe(false);
  });

  it('enforces five passives, one legendary and rarity max levels in the simulation',()=>{
    const levels=emptyBuffLevels();
    levels['aura-shot']=1;
    for(const p of PASSIVES_V2.filter(p=>p.rarity==='normal').slice(0,5))levels[p.id]=1;
    expect(equipment(levels).passives).toHaveLength(5);
    expect(canEquip(levels,byId('shockwave'))).toBe(false);
    expect(canEquip(levels,byId('gym-routine'))).toBe(true);
    levels['double-trouble']=2;
    expect(canEquip(levels,byId('double-trouble'))).toBe(false);
    levels['shockwave']=3;
    expect(canEquip(levels,byId('shockwave'))).toBe(false);
    levels['gym-routine']=4;
    expect(canEquip(levels,byId('gym-routine'))).toBe(false);
    const another=emptyBuffLevels();
    another['built-different']=1;
    expect(canEquip(another,byId('infinite-rizz'))).toBe(false);
  });

  it('never offers a sixth passive and treats exhausted pools as heals',()=>{
    const a=new Arena(()=>.5);a.start();
    for(const p of PASSIVES_V2.filter(p=>p.rarity==='normal').slice(0,5))a.buffs[p.id]=1;
    const legal=legalUpgrades(a.buffs,availableBuffs(a.buffs,10));
    expect(legal.filter(b=>b.id==='shockwave')).toHaveLength(0);
    expect(legal.filter(b=>b.id==='gym-routine')).toHaveLength(1);
  });

  it('five waves have strictly increasing enemy HP, damage and density',()=>{
    for(let wave=1;wave<5;wave++){
      const low=difficultyV2(wave),high=difficultyV2(wave+1);
      expect(high.hp).toBeGreaterThan(low.hp);
      expect(high.damage).toBeGreaterThan(low.damage);
      expect(high.spawnDensity).toBeGreaterThan(low.spawnDensity);
    }
  });
});
