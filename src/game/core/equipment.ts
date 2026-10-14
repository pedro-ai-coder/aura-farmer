import type {BuffDefinition,BuffId,BuffLevels} from '../data/buffs';

export const MAX_WEAPON_SLOTS=3;
export const MAX_PASSIVE_SLOTS=5;
import {PASSIVES_V2} from '../combatV2';
const LEGENDARY_IDS=new Set(PASSIVES_V2.filter(p=>p.rarity==='legendary').map(p=>p.id));
/** Persistent local stats remain on BuffLevels; weapon equipment is visible
 * and hard-limited through the same registry/upgrade checks. */
export const WEAPON_IDS=['aura-shot','mewing-jaw','ohio-orbiter','six-seven','rizz-blast','meme-launcher'] as const satisfies readonly BuffId[];
export type WeaponId=typeof WEAPON_IDS[number];
export function isWeapon(id:BuffId):id is WeaponId {
  return (WEAPON_IDS as readonly string[]).includes(id);
}
export function equipment(levels:Readonly<BuffLevels>):{weapons:WeaponId[];passives:BuffId[]} {
  const weapons:WeaponId[]=[];
  const passives:BuffId[]=[];
  for(const id of Object.keys(levels) as BuffId[]){
    if(levels[id]<=0)continue;
    if(isWeapon(id))weapons.push(id);
    else passives.push(id);
  }
  return {weapons,passives};
}
export function canEquip(levels:Readonly<BuffLevels>,buff:BuffDefinition):boolean{
  const level=levels[buff.id]??0;
  if(level>=buff.maxStacks)return false;
  if(level===0 && buff.rarity==='LEGENDARY' && Object.keys(levels).some(id=>id!==buff.id && (levels[id]??0)>0 && LEGENDARY_IDS.has(id)))return false;
  if(level>0)return true; // Upgrading existing equipment never uses another slot.
  const used=equipment(levels);
  return isWeapon(buff.id)?used.weapons.length<MAX_WEAPON_SLOTS:
    used.passives.length<MAX_PASSIVE_SLOTS;
}
export function legalUpgrades(levels:Readonly<BuffLevels>,catalog:readonly BuffDefinition[]):BuffDefinition[]{
 return catalog.filter(buff=>canEquip(levels,buff));
}
