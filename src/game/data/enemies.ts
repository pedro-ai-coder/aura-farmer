export type EnemyType = 'npc' | 'hater' | 'beta' | 'boss';
export interface EnemyDefinition { name: string; hp: number; speed: number; damage: number; xp: number; radius: number; color: number }
export const ENEMIES: Record<EnemyType, EnemyDefinition> = {
  npc: { name: 'NPC', hp: 32, speed: 65, damage: 8, xp: 8, radius: 17, color: 0xb9b9d9 },
  hater: { name: 'Hater', hp: 44, speed: 51, damage: 9, xp: 12, radius: 18, color: 0xff9a9d },
  beta: { name: 'Beta Bro', hp: 92, speed: 41, damage: 15, xp: 19, radius: 22, color: 0xa5e0ad },
  boss: { name: 'BIG HATER', hp: 1000, speed: 34, damage: 14, xp: 100, radius: 45, color: 0xff668c },
};
