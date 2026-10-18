/** Numeric gameplay source for the solo browser slice: GDD sections 4–12. */
export type Role = 'ranged' | 'melee' | 'tank';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export const CAPS: Record<Rarity, number> = { common: 4, rare: 3, epic: 2, legendary: 1 };
export const POWER: Record<Rarity, number> = { common: 1, rare: 1.5, epic: 2, legendary: 2.6 };
export const CHARACTER_IDS = ['sigma', 'nerd', 'six-seven', 'cool-kid', 'ohio', 'rizzler', 'alpha', 'fanum', 'beta'] as const;
export type CharacterId = typeof CHARACTER_IDS[number];
export type DemoHero = 'sigma' | 'cool-kid' | 'alpha';
export interface Hero {
    id: DemoHero;
    name: string;
    role: Role;
    hp: number;
    speed: number;
    power: number;
    resistance: number;
    starter: string;
    flex: string;
    duration: number;
    description: string;
}
export const HEROES: readonly Hero[] = [
    { id: 'sigma', name: 'The Sigma', role: 'ranged', hp: 100, speed: 180, power: 100, resistance: 0, starter: 'no-cap', flex: 'Sigma Stare', duration: 6, description: 'Lock onto one rival. Pierce the crowd. Never lose eye contact.' },
    { id: 'cool-kid', name: 'Cool Kid', role: 'melee', hp: 110, speed: 190, power: 95, resistance: .05, starter: 'keyboard-warrior', flex: 'Giga Chad Rampage', duration: 5, description: 'Keep moving to hit harder. Rampage through ordinary mobs.' },
    { id: 'alpha', name: 'Alpha Chad', role: 'tank', hp: 140, speed: 160, power: 90, resistance: .15, starter: 'cope-shield', flex: 'Alpha Hold', duration: 6, description: 'Take the hit. Hold your ground. Answer with three heavy slams.' },
];
export const heroById = (id: DemoHero): Hero => HEROES.find(h => h.id === id)!;
export interface Weapon {
    id: string;
    name: string;
    role: Role;
    interval: number;
    range: number;
    damage: number;
    shape: 'shot' | 'line' | 'blast' | 'cone' | 'pulse';
    angle?: number;
    delay?: number;
    second?: number;
    icon: string;
    description: string;
    legendary: string;
}
export const WEAPONS: readonly Weapon[] = [
    { id: 'ratio-blaster', name: 'Ratio Blaster', role: 'ranged', interval: .65, range: 520, damage: .20, shape: 'shot', icon: '↗', description: 'One aimed projectile. Stops at the first rival or cover.', legendary: 'Comment Apocalypse' },
    { id: 'no-cap', name: 'No Cap', role: 'ranged', interval: 1.6, range: 600, damage: .50, shape: 'line', icon: '⌒', description: 'Throw a cap through up to four rivals.', legendary: 'Final Verdict' },
    { id: 'brainrot-feed', name: 'Brainrot Feed', role: 'ranged', interval: 3, range: 480, damage: .65, shape: 'blast', delay: .45, icon: '▣', description: 'Mark a location; explode after 0.45s in a 100U radius.', legendary: 'Infinite Scroll' },
    { id: 'keyboard-warrior', name: 'Keyboard Warrior', role: 'melee', interval: .75, range: 95, damage: .18, shape: 'cone', angle: 100, second: .12, icon: '▦', description: 'Two keyboard strikes, 0.12s apart. One proc per attack.', legendary: 'Caps Lock' },
    { id: 'ban-hammer', name: 'Ban Hammer', role: 'melee', interval: 2.4, range: 125, damage: .90, shape: 'cone', angle: 120, delay: .30, icon: '⚒', description: 'Heavy wind-up. Pushes mobs and adds 15 boss stagger.', legendary: 'Perma Ban' },
    { id: 'touch-grass', name: 'Touch Grass', role: 'melee', interval: 1.5, range: 145, damage: .40, shape: 'cone', angle: 180, icon: '❧', description: 'Wide whip. Slows rivals 15% for 1.5s.', legendary: 'Go Outside' },
    { id: 'cope-shield', name: 'Cope Shield', role: 'tank', interval: 2, range: 100, damage: .45, shape: 'cone', angle: 100, icon: '⬟', description: 'Shield bash. A hit grants a 4% HP shield for 2s.', legendary: 'Unbothered' },
    { id: 'chad-hands', name: 'Chad Hands', role: 'tank', interval: 1.2, range: 90, damage: .22, shape: 'cone', angle: 90, second: .18, icon: '✊', description: 'Two punches. Every third successful attack ends in a slam.', legendary: 'Gigachad Moment' },
    { id: 'personal-space', name: 'Personal Space', role: 'tank', interval: 2.8, range: 135, damage: .40, shape: 'pulse', icon: '◎', description: 'Circular pulse. Hit rivals deal 8% less damage for 2s.', legendary: 'My Aura, My Rules' },
];
export interface Passive {
    id: string;
    name: string;
    rarity: Rarity;
    role?: Role;
    icon: string;
    description: string;
}
/** Deliberate 23-passive solo subset. Team transfer and five omitted passives are not offered. */
export const PASSIVES: readonly Passive[] = [
    { id: 'main-character', name: 'Main Character Energy', rarity: 'common', icon: '★', description: '+6% weapon damage per level.' },
    { id: 'terminally-online', name: 'Terminally Online', rarity: 'common', icon: '⌁', description: '+5% weapon frequency per level.' },
    { id: 'built-different', name: 'Built Different', rarity: 'common', icon: '♥', description: '+8% maximum HP per level; heal only the added HP.' },
    { id: 'thick-skin', name: 'Thick Skin', rarity: 'common', icon: '⬡', description: '3% damage reduction per level, multiplicative with other sources.' },
    { id: 'caught-4k', name: 'Caught in 4K', rarity: 'common', icon: '»', description: '+5% movement speed per level.' },
    { id: 'big-meme', name: 'Big Meme Energy', rarity: 'common', icon: '◉', description: '+6% area radius per level.' },
    { id: 'timeline', name: 'Across the Timeline', rarity: 'common', role: 'ranged', icon: '↔', description: '+8% weapon range per level; projectile speed follows.' },
    { id: 'hands-on-sight', name: 'Hands On Sight', rarity: 'common', role: 'melee', icon: '✊', description: '+7% damage per level to targets within 150U.' },
    { id: 'cope-harder', name: 'Cope Harder', rarity: 'common', role: 'tank', icon: '⬟', description: '+8% shields granted per level.' },
    { id: 'certified-w', name: 'Certified W', rarity: 'common', icon: 'W', description: '+6% healing and shields granted per level.' },
    { id: 'no-cap-streak', name: 'No Cap Streak', rarity: 'rare', role: 'ranged', icon: 'Ⅴ', description: 'Every fifth weapon activation: +10% damage and +1 piercing per level (damage does not scale with level).' },
    { id: 'w-wifi', name: 'W Wi-Fi', rarity: 'rare', role: 'ranged', icon: '≋', description: 'Every 12s: fixed 160U zone for 4s, +8/12/16% frequency.' },
    { id: 'let-him-cook', name: 'Let Him Cook', rarity: 'rare', role: 'melee', icon: '♨', description: 'Primary hits grant +3/4/5% damage, up to 5 stacks. Expires after 3s.' },
    { id: 'homie-check', name: 'Homie Check', rarity: 'rare', role: 'melee', icon: '♡', description: 'Every 8 primary hits: heal 3/4/5% HP. Minimum 6s between pulses.' },
    { id: 'big-chad', name: 'Big Chad Energy', rarity: 'rare', role: 'tank', icon: '▣', description: 'Every 10s in combat: shield 5/7/9% HP for 4s.' },
    { id: 'its-over', name: "It's So Over", rarity: 'epic', icon: '↓', description: '+15/25% damage to targets below 30% HP.' },
    { id: 'aura-viral', name: 'Aura Goes Viral', rarity: 'epic', icon: '✦', description: 'Activating Flex grants +12/18% frequency for 5s.' },
    { id: 'so-back', name: 'We Are So Back', rarity: 'epic', icon: '↟', description: 'Cross below 30% HP: heal 10/15% over 5s and shield 10% for 3s. 45s cooldown.' },
    { id: 'six-to-seven', name: 'Six → Seven', rarity: 'epic', icon: '67', description: 'Seventh primary hit explodes for 35/50% power in 90U. 2s cooldown.' },
    { id: 'absolute-cinema', name: 'Absolute Cinema', rarity: 'legendary', icon: '★', description: '+25% weapon damage, plus 20% during Flex.' },
    { id: 'w-squad', name: 'W Squad', rarity: 'legendary', icon: 'W', description: '+25% healing/shields. Flex grants +10% weapon damage for 6s.' },
    { id: 'too-sigma', name: 'Too Sigma to Fall', rarity: 'legendary', icon: '⬟', description: 'Cross below 25% HP: shield 25% HP for 5s. 60s cooldown. Cannot prevent a fatal hit.' },
    { id: 'no-u', name: 'No U', rarity: 'legendary', icon: '↶', description: 'Every 15s: 30% power pulse in 200U, reducing mob damage 20%/4s (boss 10%/2s).' },
];
export const weaponById = (id: string) => WEAPONS.find(w => w.id === id);
export const passiveById = (id: string) => PASSIVES.find(p => p.id === id);
export const WAVES = [
    { name: 'First Post', hp: 1, damage: .8, density: .9, weights: [90, 10, 0] },
    { name: 'Comment Section', hp: 1.3, damage: .88, density: 1, weights: [70, 28, 2] },
    { name: 'Going Viral', hp: 1.65, damage: 1.3, density: 1.4, weights: [45, 45, 10] },
    { name: 'Cancel Storm', hp: 2.05, damage: 1.5, density: 1.65, weights: [25, 50, 25] },
    { name: 'Final Ratio', hp: 2.5, damage: 1.75, density: 1.9, weights: [10, 50, 40] },
] as const;
export const WAVE_SECONDS = 180;
export const BOSS_START = 900;
export const BERSERK_AFTER = 180;
export const xpRequired = (level: number) => 30 + 8 * level + level * level;
