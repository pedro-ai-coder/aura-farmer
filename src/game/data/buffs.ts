export type BuffId = 'sigma' | 'alpha' | 'mewing' | 'locked-in' | 'drip' | 'speed' | 'six-seven' | 'thick-skin' | 'mewing-jaw' | 'ohio-orbiter' | 'crash-out' | 'skibidi-bounce' | 'delulu' | 'touch-grass' | 'mogged' | 'rizz-aura' | 'aura-shot' | 'rizz-blast';
export interface BuffDefinition { id: BuffId; name: string; description: string; maxStacks: number; rarity: 'COMMON' | 'RARE' | 'EPIC' }
export const BUFFS: BuffDefinition[] = [
  { id:'aura-shot',name:'Aura Shot',description:'Automatic aimed bolts. Higher levels increase damage and speed at a controlled rate.',maxStacks:4,rarity:'COMMON' },
  { id:'rizz-blast',name:'Rizz Pulse',description:'A short-range purple shockwave hits groups automatically. Upgrades increase radius and damage.',maxStacks:4,rarity:'RARE' },
  { id: 'sigma', name: 'Sigma Aura', description: '+11% damage per level after reaching 50 Aura.', maxStacks: 2, rarity: 'RARE' },
  { id: 'alpha', name: 'Alpha Aura', description: '+0.9% damage per nearby enemy per level (max 10). Total damage is capped.', maxStacks: 2, rarity: 'RARE' },
  { id: 'mewing', name: 'Mewing Streak', description: '+8% crit chance per level after 8s without taking damage.', maxStacks: 2, rarity: 'COMMON' },
  { id: 'locked-in', name: 'Locked In', description: '+18% attack speed per level after 8s without taking damage.', maxStacks: 2, rarity: 'RARE' },
  { id: 'drip', name: 'Drip Check', description: 'Reduce incoming damage by 1.', maxStacks: 3, rarity: 'COMMON' },
  { id: 'speed', name: 'Bro Has Motion', description: '+12% movement speed.', maxStacks: 3, rarity: 'COMMON' },
  { id: 'six-seven', name: 'Six Seven', description: 'Automatic radial volleys and the signature 67-kill burst; each level adds projectiles and damage.', maxStacks: 4, rarity: 'EPIC' },
  { id: 'thick-skin', name: 'Absolute Unit', description: '+20 max HP and restore 20 HP. Wave heals remain limited.', maxStacks: 3, rarity: 'COMMON' },
  { id: 'mewing-jaw', name: 'Mewing Jaw', description: 'Close-range strike. Higher levels extend reach, damage and frequency.', maxStacks: 4, rarity: 'RARE' },
  { id: 'ohio-orbiter', name: 'Ohio Orbiter', description: 'Orbiting attack orb. Higher levels increase hit radius, damage and frequency.', maxStacks: 4, rarity: 'EPIC' },
  { id: 'crash-out', name: 'Crash Out', description: 'Below 35% HP: +26% damage, but +20% damage taken.', maxStacks: 1, rarity: 'RARE' },
  { id: 'skibidi-bounce', name: 'Skibidi Bounce', description: 'Your shots bounce once for 55% damage.', maxStacks: 1, rarity: 'EPIC' },
  { id: 'delulu', name: 'Delulu Is the Solulu', description: 'Ignore one fatal hit per wave.', maxStacks: 1, rarity: 'EPIC' },
  { id: 'touch-grass', name: 'Touch Grass', description: 'Heal slowly after avoiding damage.', maxStacks: 1, rarity: 'COMMON' },
  { id: 'mogged', name: 'Mogged', description: 'First hit on an enemy deals +15% damage.', maxStacks: 2, rarity: 'COMMON' },
  { id: 'rizz-aura', name: 'Rizz Aura', description: 'Every 12 kills, slow nearby enemies.', maxStacks: 1, rarity: 'RARE' },
];
export type BuffLevels = Record<BuffId, number>;
export function emptyBuffLevels(): BuffLevels {
  return Object.fromEntries(BUFFS.map(buff => [buff.id, 0])) as BuffLevels;
}
export function availableBuffs(levels: BuffLevels): BuffDefinition[] {
  return BUFFS.filter(buff => levels[buff.id] < buff.maxStacks); // Legacy raw catalog; Arena filters capacity too.
}
