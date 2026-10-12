/** Character identities and starting kits. Keep character numbers separate from buffs. */
export const CHARACTER_IDS = ['sigma','alpha','rizzler','ohio','fanum','six-seven','cool-kid','nerd'] as const;
export type CharacterId = typeof CHARACTER_IDS[number];
export type CharacterDefinition = {
  id: CharacterId; name: string; subtitle: string; role: string;
  description: string; difficulty: string; hp: number; speed: number;
  damage: number; fireRate: number; crit: number; armor: number;
  color: number; cssColor: string; weapon: string; passive: string;
  unlockedBy?: string;
};
export const CHARACTERS: readonly CharacterDefinition[] = [
  { id:'sigma', name:'The Sigma', subtitle:'Main character energy', role:'Balanced',
    description:'Classic Aura Shot and FLEX. No weaknesses.', difficulty:'EASY',
    hp:1,speed:1,damage:1,fireRate:1,crit:0,armor:0,color:0xffffff,cssColor:'#44345f',
    weapon:'Aura Shot',passive:'Standard FLEX and Sigma Focus' },
  { id:'alpha',name:'Alpha Chad',subtitle:'Certified unit',role:'Tank / Melee',
    description:'Heavy melee starter, durable but slower.',difficulty:'EASY',
    hp:1.2,speed:.92,damage:.9,fireRate:1,crit:0,armor:0,color:0xffbf81,cssColor:'#d98141',
    weapon:'Mewing Jaw',passive:'Close-range hits deal +15% damage' },
  { id:'rizzler',name:'The Rizzler',subtitle:'Maximum charisma',role:'Crowd control',
    description:'Starts with Rizz Aura crowd slow. Trades damage for control.',difficulty:'MEDIUM',
    hp:.9,speed:1,damage:.92,fireRate:1,crit:0,armor:0,color:0xfca9d7,cssColor:'#e987bc',
    weapon:'Aura Shot',passive:'Rizz Aura active from wave one' },
  { id:'ohio',name:'Ohio Kid',subtitle:'Movement is the meta',role:'Speed / Crit',
    description:'Fragile sprinter who earns bonus shots while moving.',difficulty:'HARD',
    hp:.75,speed:1.18,damage:1,fireRate:1,crit:.05,armor:0,color:0x80edf4,cssColor:'#35b4c9',
    weapon:'Ohio Blaster',passive:'Bonus shot every 280 units moved' },
  { id:'fanum',name:'Fanum Lord',subtitle:'Tax collector',role:'XP collector',
    description:'Collects more XP, but attacks slightly more slowly.',difficulty:'MEDIUM',
    hp:1,speed:1,damage:1,fireRate:.9,crit:0,armor:0,color:0x83e4ab,cssColor:'#4bae83',
    weapon:'Aura Shot',passive:'+25% collected XP',unlockedBy:'Collect 500 XP across runs' },
  { id:'six-seven',name:'Six Seven Kid',subtitle:'Number goes brrr',role:'Radial shots',
    description:'Starts with Six Seven, but has lower max HP.',difficulty:'HARD',
    hp:.85,speed:1.04,damage:1,fireRate:1,crit:0,armor:0,color:0xffe58a,cssColor:'#d8ac3b',
    weapon:'67 Volley',passive:'Six Seven equipped from start',unlockedBy:'Kill 67 enemies and trigger Six Seven' },
  { id:'cool-kid',name:'Cool Kid',subtitle:'Future Giga Chad energy',role:'Evolver / Melee',
    description:'Gather Alpha Essence to unleash the five-second Giga Chad Rampage FLEX.',
    difficulty:'EASY',hp:1.1,speed:1.05,damage:.95,fireRate:1,crit:0,armor:0,
    color:0xf5b66d,cssColor:'#e7a45c',weapon:'Mewing Jaw',passive:'Starter melee strike · Alpha FLEX affinity' },
  { id:'nerd',name:'Nerd',subtitle:'Calculating Sigma energy',role:'Evolver / Ranged',
    description:'Gather Sigma Essence to fire piercing, accelerated FLEX projectiles.',
    difficulty:'MEDIUM',hp:.85,speed:1.02,damage:1.06,fireRate:1.08,crit:.04,armor:0,
    color:0x8fe4f1,cssColor:'#5aa2c8',weapon:'Aura Shot',passive:'Precision starter · Sigma FLEX affinity' },
];
export function getCharacter(id: CharacterId): CharacterDefinition {
  return CHARACTERS.find(c => c.id === id) ?? CHARACTERS[0];
}
export function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === 'string' && CHARACTER_IDS.some(id => id === value);
}
