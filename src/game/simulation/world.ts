export interface Point {
    x: number;
    y: number;
}
/**
 * B2.4 expands Ruin Alley without stretching the approved original painting.
 * The 1448x1086 illustration remains a central district at its native scale.
 */
export const WORLD = { width: 3500, height: 2650 };
export const ORIGINAL_ALLEY = { width: 1448, height: 1086 } as const;
export const ALLEY_ORIGIN = {
    x: (WORLD.width - ORIGINAL_ALLEY.width) / 2,
    y: (WORLD.height - ORIGINAL_ALLEY.height) / 2,
} as const;
export const RUN_START: Point = {
    x: ALLEY_ORIGIN.x + 724, y: ALLEY_ORIGIN.y + 610,
};
export const BOSS_ENTRY: Point = {
    x: ALLEY_ORIGIN.x + 724, y: ALLEY_ORIGIN.y + 445,
};
/** Chamfered, visibly outlined walkable arena extending over three camera widths.
 * Collision and all artist-approved props use the same authoritative coordinates.
 */
export const FLOOR: readonly Point[] = [
    { x: 240, y: 210 }, { x: 590, y: 140 },
    { x: 2980, y: 140 }, { x: 3300, y: 250 },
    { x: 3380, y: 580 }, { x: 3380, y: 2110 },
    { x: 3220, y: 2460 }, { x: 2880, y: 2500 },
    { x: 560, y: 2500 }, { x: 180, y: 2350 },
    { x: 120, y: 2020 }, { x: 120, y: 570 },
];
/** Every prop is represented by a real collision. No fake blocking scenery.
 * The first two cover crates retain their precise locations relative to the
 * original illustration; the additional crates create traversable landmarks.
 */
export const COVER = [
    { x: ALLEY_ORIGIN.x + 600, y: ALLEY_ORIGIN.y + 550, r: 30 },
    { x: ALLEY_ORIGIN.x + 940, y: ALLEY_ORIGIN.y + 680, r: 30 },
    { x: 550, y: 515, r: 30 }, { x: 1070, y: 420, r: 30 },
    { x: 2370, y: 480, r: 30 }, { x: 3040, y: 760, r: 30 },
    { x: 2880, y: 1500, r: 30 }, { x: 2420, y: 2110, r: 30 },
    { x: 1510, y: 2250, r: 30 }, { x: 630, y: 1900, r: 30 },
    { x: 470, y: 1160, r: 30 },
];
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export const direction = (a: Point, b: Point) => Math.atan2(b.y - a.y, b.x - a.x);
export const angleDelta = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
export function inFloor(p: Point, radius = 16): boolean {
    let inside = false;
    for (let i = 0; i < FLOOR.length; i++) {
        const a = FLOOR[i], b = FLOOR[(i + 1) % FLOOR.length], dx = b.x - a.x, dy = b.y - a.y;
        const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
        if (distance(p, { x: a.x + t * dx, y: a.y + t * dy }) < radius)
            return false;
        if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x)
            inside = !inside;
    }
    return inside;
}
export function walkable(p: Point, radius = 16): boolean { return inFloor(p, radius) && COVER.every(o => distance(p, o) > o.r + radius); }
export function move(p: Point, dx: number, dy: number, radius = 16): Point {
    const x = { x: p.x + dx, y: p.y };
    const first = walkable(x, radius) ? x : p;
    const y = { x: first.x, y: first.y + dy };
    return walkable(y, radius) ? y : first;
}
export function clearLine(a: Point, b: Point): boolean {
    const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy;
    return COVER.every(o => { const t = l ? Math.max(0, Math.min(1, ((o.x - a.x) * dx + (o.y - a.y) * dy) / l)) : 0; return distance(o, { x: a.x + dx * t, y: a.y + dy * t }) > o.r; });
}
export function spawnPoint(player: Point, random: () => number): Point | null {
    // World expansion must not strand spawns in the original 1448x1086 district.
    // Keep combat near the moving camera, without changing wave counts, enemy
    // eligibility, attack timing or seeded randomness.
    for (let i = 0; i < 80; i++) {
        const angle = random() * Math.PI * 2;
        const radius = 275 + random() * 365;
        const p = {
            x: player.x + Math.cos(angle) * radius,
            y: player.y + Math.sin(angle) * radius,
        };
        if (walkable(p, 24) && distance(p, player) >= 260)
            return p;
    }
    return null;
}
export function seededRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => { state += 0x6D2B79F5; let t = state; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
