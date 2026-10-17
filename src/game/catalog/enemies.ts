export type EnemyKind = 'npc' | 'hater' | 'reply-goblin' | 'beta' | 'ratio-ram' | 'doomscroller' | 'hype-bot' | 'fanum-leech' | 'ping-sniper' | 'copium-puffer' | 'comment-mod' | 'reply-guy' | 'mod-supremo' | 'ohio-express' | 'doomscroll-prime' | 'boss' | 'terminal';
export interface EnemyDefinition {
    name: string;
    hp: number;
    speed: number;
    damage: number;
    xp: number;
    wave: number;
    radius: number;
    boss?: boolean;
}
export const ENEMIES: Record<EnemyKind, EnemyDefinition> = {
    'npc': { name: 'Phone Guy', hp: 35, speed: 75, damage: 8, xp: 5, wave: 1, radius: 15 },
    'hater': { name: 'Hater', hp: 50, speed: 60, damage: 10, xp: 8, wave: 1, radius: 17 },
    'reply-goblin': { name: 'Reply Goblin', hp: 25, speed: 125, damage: 6, xp: 6, wave: 2, radius: 12 },
    'beta': { name: 'Beta Bot', hp: 120, speed: 45, damage: 16, xp: 12, wave: 2, radius: 21 },
    'ratio-ram': { name: 'Ratio Ram', hp: 80, speed: 60, damage: 20, xp: 10, wave: 2, radius: 19 },
    'doomscroller': { name: 'Doomscroller', hp: 70, speed: 50, damage: 8, xp: 12, wave: 3, radius: 17 },
    'hype-bot': { name: 'Hype Bot', hp: 65, speed: 55, damage: 6, xp: 12, wave: 3, radius: 17 },
    'fanum-leech': { name: 'Fanum Leech', hp: 90, speed: 70, damage: 10, xp: 12, wave: 3, radius: 18 },
    'ping-sniper': { name: 'Ping Sniper', hp: 60, speed: 40, damage: 24, xp: 12, wave: 4, radius: 16 },
    'copium-puffer': { name: 'Copium Puffer', hp: 90, speed: 45, damage: 12, xp: 12, wave: 4, radius: 21 },
    'comment-mod': { name: 'Comment Mod', hp: 100, speed: 50, damage: 10, xp: 14, wave: 5, radius: 18 },
    'reply-guy': { name: 'Reply Guy', hp: 1400, speed: 40, damage: 14, xp: 120, wave: 2, radius: 32, boss: true },
    'mod-supremo': { name: 'Mod Supremo', hp: 3200, speed: 32, damage: 28, xp: 240, wave: 3, radius: 36, boss: true },
    'ohio-express': { name: 'Ohio Express', hp: 2800, speed: 55, damage: 22, xp: 120, wave: 4, radius: 34, boss: true },
    'doomscroll-prime': { name: 'Doomscroll Prime', hp: 5200, speed: 25, damage: 18, xp: 240, wave: 5, radius: 38, boss: true },
    'boss': { name: 'Big Hater', hp: 30000, speed: 22, damage: 12, xp: 0, wave: 6, radius: 48, boss: true },
    'terminal': { name: 'Silence Terminal', hp: 250, speed: 0, damage: 0, xp: 0, wave: 5, radius: 19 },
};
export const EVENTS: readonly {
    at: number;
    kind: EnemyKind;
}[] = [{ at: 195, kind: 'reply-guy' }, { at: 375, kind: 'mod-supremo' }, { at: 555, kind: 'ohio-express' }, { at: 735, kind: 'doomscroll-prime' }];
