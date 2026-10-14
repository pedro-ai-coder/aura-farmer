import {PASSIVES_V2,WEAPONS_V2} from '../combatV2';
export type BuffId = string;
export interface BuffDefinition { id: BuffId; name: string; description: string; maxStacks: number; rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' }
export const BUFFS: BuffDefinition[] = [
  ...WEAPONS_V2.map(w=>({id:w.id,name:w.name,description:w.role,maxStacks:w.maxLevel,rarity:'COMMON' as const})),
  ...PASSIVES_V2.map(p=>({id:p.id,name:p.name,description:p.description,maxStacks:p.maxLevel,
    rarity:(p.rarity==='normal'?'COMMON':p.rarity.toUpperCase()) as BuffDefinition['rarity']})),
];

export const V2_OFFER_IDS=new Set([...WEAPONS_V2.map(w=>w.id),...PASSIVES_V2.map(p=>p.id)]);
export type BuffLevels = Record<BuffId, number>;
export function emptyBuffLevels(): BuffLevels {
  return Object.fromEntries(BUFFS.map(buff => [buff.id, 0])) as BuffLevels;
}
export function availableBuffs(levels: BuffLevels, xpLevel=1): BuffDefinition[] {
  return BUFFS.filter(buff => {
    if(!V2_OFFER_IDS.has(buff.id) || (levels[buff.id]??0)>=buff.maxStacks)return false;
    const passive=PASSIVES_V2.find(p=>p.id===buff.id);
    return !passive || (passive.rarity==='normal' || (passive.rarity==='rare'&&xpLevel>=3)
      || (passive.rarity==='epic'&&xpLevel>=6) || (passive.rarity==='legendary'&&xpLevel>=10));
  });
}
