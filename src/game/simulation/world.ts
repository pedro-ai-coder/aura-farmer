export interface Point {
    x: number;
    y: number;
}
export const WORLD = { width: 1448, height: 1086 };
/** Foot-level boundary traced against the approved Ruin Alley floor, in master-image pixels. */
export const FLOOR: readonly Point[] = [{ x: 234, y: 448 }, { x: 440, y: 334 }, { x: 825, y: 287 }, { x: 1047, y: 408 }, { x: 1255, y: 550 }, { x: 1310, y: 713 }, { x: 1182, y: 843 }, { x: 831, y: 979 }, { x: 666, y: 880 }, { x: 445, y: 786 }, { x: 250, y: 772 }, { x: 169, y: 642 }];
export const COVER = [{ x: 600, y: 550, r: 30 }, { x: 940, y: 680, r: 30 }];
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
    for (let i = 0; i < 80; i++) {
        const p = { x: 180 + random() * 1100, y: 300 + random() * 650 };
        if (walkable(p, 24) && distance(p, player) >= 260)
            return p;
    }
    return null;
}
export function seededRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => { state += 0x6D2B79F5; let t = state; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
