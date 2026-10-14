import {PASSIVES_V2,WEAPONS_V2} from '../combatV2';
export type BuffId = string;
export interface BuffDefinition { id: BuffId; name: string; description: string; maxStacks: number; rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' }
export const BUFFS: BuffDefinition[] = [
  { id:'aura-shot',name:'Aura Shot',description:'Automatic aimed bolts. Higher levels increase damage and speed.',maxStacks:4,rarity:'COMMON' },
  { id:'rizz-blast',name:'Rizz Pulse',description:'A short-range purple shockwave hits groups automatically. Upgrades increase radius and damage.',maxStacks:4,rarity:'RARE' },
  { id: 'sigma', name: 'Sigma Aura', description: '+15% damage while you have 50+ Aura.', maxStacks: 2, rarity: 'RARE' },
  { id: 'alpha', name: 'Alpha Aura', description: '+1.5% damage per nearby enemy (max 10).', maxStacks: 2, rarity: 'RARE' },
  { id: 'mewing', name: 'Mewing Streak', description: '+10% crit chance after 8s without taking damage.', maxStacks: 2, rarity: 'COMMON' },
  { id: 'locked-in', name: 'Locked In', description: '+25% attack speed after 8s without taking damage.', maxStacks: 2, rarity: 'RARE' },
  { id: 'drip', name: 'Drip Check', description: 'Reduce incoming damage by 1.', maxStacks: 3, rarity: 'COMMON' },
  { id: 'speed', name: 'Bro Has Motion', description: '+12% movement speed.', maxStacks: 3, rarity: 'COMMON' },
  { id: 'six-seven', name: 'Six Seven', description: 'Automatic radial volleys and the signature 67-kill burst; each level adds projectiles and damage.', maxStacks: 4, rarity: 'EPIC' },
  { id: 'thick-skin', name: 'Thick Skin', description: '+5% max HP per level and heal on upgrade.', maxStacks: 4, rarity: 'COMMON' },
  { id: 'mewing-jaw', name: 'Mewing Jaw', description: 'Close-range strike. Higher levels extend reach, damage and frequency.', maxStacks: 4, rarity: 'RARE' },
  { id: 'ohio-orbiter', name: 'Ohio Orbiter', description: 'Orbiting attack orb. Higher levels increase hit radius, damage and frequency.', maxStacks: 4, rarity: 'EPIC' },
  { id: 'crash-out', name: 'Crash Out', description: 'Low HP, high chaos. +40% damage, but +20% damage taken.', maxStacks: 1, rarity: 'RARE' },
  { id: 'skibidi-bounce', name: 'Skibidi Bounce', description: 'Your shots bounce once for 55% damage.', maxStacks: 1, rarity: 'EPIC' },
  { id: 'delulu', name: 'Delulu Is the Solulu', description: 'Ignore one fatal hit per wave.', maxStacks: 1, rarity: 'EPIC' },
  { id: 'touch-grass', name: 'Touch Grass', description: 'Heal slowly after avoiding damage.', maxStacks: 1, rarity: 'COMMON' },
  { id: 'mogged', name: 'Mogged', description: 'First hit on an enemy deals +15% damage.', maxStacks: 2, rarity: 'COMMON' },
  { id: 'rizz-aura', name: 'Rizz Aura', description: 'Every 12 kills, slow nearby enemies.', maxStacks: 1, rarity: 'RARE' },
];

// Legacy bonuses stay valid for old tests/saves, but only the V2 catalog is
// offered during new runs. Do not duplicate the Thick Skin definition.
const legacyIds=new Set(BUFFS.map(buff=>buff.id));
for(const weapon of WEAPONS_V2){
  if(!legacyIds.has(weapon.id)){
    BUFFS.push({id:weapon.id,name:weapon.name,description:weapon.role,maxStacks:weapon.maxLevel,rarity:'COMMON'});
    legacyIds.add(weapon.id);
  }
}
for(const passive of PASSIVES_V2){
  if(!legacyIds.has(passive.id)){
    BUFFS.push({id:passive.id,name:passive.name,description:passive.description,
      maxStacks:passive.maxLevel,rarity:passive.rarity==='normal'?'COMMON':
      passive.rarity==='rare'?'RARE':passive.rarity==='epic'?'EPIC':'LEGENDARY'});
    legacyIds.add(passive.id);
  }
}
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
