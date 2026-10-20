export interface Point {
    x: number;
    y: number;
}
/**
 * B2.4: the original 1448x1086 district retains its EXISTING simulation
 * coordinates. Extending the world into negative world-space avoids moving
 * approved characters, weapon ranges, Safe Spot, bosses or legacy collisions.
 */
export const WORLD = { width: 3500, height: 2650 };
export const ORIGINAL_ALLEY = { width: 1448, height: 1086 } as const;
/** World bounding rectangle starts left/up of the previously centred district. */
export const WORLD_ORIGIN = {
    x: (ORIGINAL_ALLEY.width - WORLD.width) / 2,
    y: (ORIGINAL_ALLEY.height - WORLD.height) / 2,
} as const;
export const WORLD_CENTER: Point = {
    x: WORLD_ORIGIN.x + WORLD.width / 2,
    y: WORLD_ORIGIN.y + WORLD.height / 2,
};
/** Original PNG stays at precisely its former world-space coordinates. */
export const ALLEY_ORIGIN = { x: 0, y: 0 } as const;
export const RUN_START: Point = { x: 724, y: 610 };
export const BOSS_ENTRY: Point = { x: 724, y: 445 };
const EXTENDED_FLOOR: readonly Point[] = [
    { x: 240, y: 210 }, { x: 590, y: 140 },
    { x: 2980, y: 140 }, { x: 3300, y: 250 },
    { x: 3380, y: 580 }, { x: 3380, y: 2110 },
    { x: 3220, y: 2460 }, { x: 2880, y: 2500 },
    { x: 560, y: 2500 }, { x: 180, y: 2350 },
    { x: 120, y: 2020 }, { x: 120, y: 570 },
];
/** Chamfered collision perimeter translated around the original district. */
export const FLOOR: readonly Point[] = EXTENDED_FLOOR.map(p => ({
    x: p.x + WORLD_ORIGIN.x,
    y: p.y + WORLD_ORIGIN.y,
}));
/** First two props retain their EXACT original positions and hitboxes.
 * Nine new visible crates have one-to-one collision correspondence.
 */
export const COVER = [
    { x: 600, y: 550, r: 30 },
    { x: 940, y: 680, r: 30 },
    ...([
        { x: 550, y: 515, r: 30 }, { x: 1070, y: 420, r: 30 },
        { x: 2370, y: 480, r: 30 }, { x: 3040, y: 760, r: 30 },
        { x: 2880, y: 1500, r: 30 }, { x: 2420, y: 2110, r: 30 },
        { x: 1510, y: 2250, r: 30 }, { x: 630, y: 1900, r: 30 },
        { x: 470, y: 1160, r: 30 },
    ] as const).map(p => ({
        x: p.x + WORLD_ORIGIN.x,
        y: p.y + WORLD_ORIGIN.y, r: p.r,
    })),
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
