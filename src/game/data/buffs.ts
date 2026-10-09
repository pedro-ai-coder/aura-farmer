export type BuffId = 'sigma' | 'alpha' | 'mewing' | 'locked-in' | 'drip' | 'speed' | 'six-seven' | 'thick-skin' | 'mewing-jaw' | 'ohio-orbiter';
export interface BuffDefinition { id: BuffId; name: string; description: string; maxStacks: number; rarity: 'COMMON' | 'RARE' | 'EPIC' }
export const BUFFS: BuffDefinition[] = [
  { id: 'sigma', name: 'Sigma Aura', description: '+15% damage while you have 50+ Aura.', maxStacks: 2, rarity: 'RARE' },
  { id: 'alpha', name: 'Alpha Aura', description: '+1.5% damage per nearby enemy (max 10).', maxStacks: 2, rarity: 'RARE' },
  { id: 'mewing', name: 'Mewing Streak', description: '+10% crit chance after 8s without taking damage.', maxStacks: 2, rarity: 'COMMON' },
  { id: 'locked-in', name: 'Locked In', description: '+25% attack speed after 8s without taking damage.', maxStacks: 2, rarity: 'RARE' },
  { id: 'drip', name: 'Drip Check', description: 'Reduce incoming damage by 1.', maxStacks: 3, rarity: 'COMMON' },
  { id: 'speed', name: 'Bro Has Motion', description: '+12% movement speed.', maxStacks: 3, rarity: 'COMMON' },
  { id: 'six-seven', name: 'Six Seven', description: 'Every 67 kills, fire 7 radial projectiles.', maxStacks: 1, rarity: 'EPIC' },
  { id: 'thick-skin', name: 'Absolute Unit', description: '+20 max HP and restore 20 HP.', maxStacks: 3, rarity: 'COMMON' },
  { id: 'mewing-jaw', name: 'Mewing Jaw', description: 'Unlock an automatic close-range strike.', maxStacks: 1, rarity: 'RARE' },
  { id: 'ohio-orbiter', name: 'Ohio Orbiter', description: 'Unlock an orbiting damage orb.', maxStacks: 1, rarity: 'EPIC' },
];
export type BuffLevels = Record<BuffId, number>;
export function emptyBuffLevels(): BuffLevels {
  return Object.fromEntries(BUFFS.map(buff => [buff.id, 0])) as BuffLevels;
}
export function availableBuffs(levels: BuffLevels): BuffDefinition[] {
  return BUFFS.filter(buff => levels[buff.id] < buff.maxStacks);
}
