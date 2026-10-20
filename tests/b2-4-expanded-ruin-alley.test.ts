import { describe, expect, it } from 'vitest';
import {
    ALLEY_ORIGIN, WORLD_ORIGIN, BOSS_ENTRY, COVER, FLOOR, ORIGINAL_ALLEY, RUN_START,
    WORLD, clearLine, inFloor, move, seededRandom, spawnPoint, walkable,
} from '../src/game/simulation/world';
import { Run } from '../src/game/simulation/run';
import { FLOOR_PATCH, FLOOR_TILE_SIZE } from '../src/browser/ruin-alley-expansion';

describe('B2.4 Ruin Alley expanded geography without new art or characters', () => {
    it('has over three combat-camera widths, central original art at native scale', () => {
        expect(WORLD).toEqual({ width: 3500, height: 2650 });
        expect(WORLD.width / 1040).toBeGreaterThan(3);
        expect(WORLD.height / 585).toBeGreaterThan(4);
        expect(ORIGINAL_ALLEY).toEqual({ width: 1448, height: 1086 });
        expect(WORLD_ORIGIN).toEqual({ x: -1026, y: -782 });
        expect(ALLEY_ORIGIN).toEqual({ x: 0, y: 0 });
        expect(RUN_START).toEqual({ x: 724, y: 610 });
        expect(BOSS_ENTRY).toEqual({ x: 724, y: 445 });
        expect(FLOOR_TILE_SIZE).toBe(2 * FLOOR_PATCH.size);
        expect(FLOOR_PATCH.x + FLOOR_PATCH.size).toBeLessThanOrEqual(ORIGINAL_ALLEY.width);
        expect(FLOOR_PATCH.y + FLOOR_PATCH.size).toBeLessThanOrEqual(ORIGINAL_ALLEY.height);
    });

    it('every painted barrier is collision-backed, central healing/boss anchors are valid', () => {
        expect(FLOOR).toHaveLength(12);
        expect(COVER).toHaveLength(11);
        for (const cover of COVER) {
            expect(inFloor(cover, cover.r + 8)).toBe(true);
            expect(walkable(cover)).toBe(false);
        }
        expect(COVER[0]).toMatchObject({
            x: ALLEY_ORIGIN.x + 600, y: ALLEY_ORIGIN.y + 550, r: 30,
        });
        expect(COVER[1]).toMatchObject({
            x: ALLEY_ORIGIN.x + 940, y: ALLEY_ORIGIN.y + 680, r: 30,
        });
        expect(walkable(RUN_START)).toBe(true);
        expect(walkable(BOSS_ENTRY)).toBe(true);
        const run = new Run('sigma', 2026);
        expect(run.pos).toEqual(RUN_START);
        expect(run.safeSpot).toMatchObject({
            x: ALLEY_ORIGIN.x + 1100, y: ALLEY_ORIGIN.y + 565,
        });
        expect(walkable(run.safeSpot)).toBe(true);
        expect(clearLine(RUN_START, run.safeSpot)).toBe(true);
    });

    it('allows a meaningful cross-map walk across more than two camera widths', () => {
        let point = { x: -626, y: 610 };
        expect(walkable(point)).toBe(true);
        for (let i = 0; i < 270; i++) {
            const moved = move(point, 10, 0);
            expect(moved.x).toBeGreaterThan(point.x);
            point = moved;
        }
        expect(point.x).toBe(2074);
        expect(walkable(point)).toBe(true);
        expect(walkable({ x: -1050, y: 1000 })).toBe(false);
        expect(walkable({ x: 2490, y: 1100 })).toBe(false);
    });

    it('seeded mobs can spawn around the player in several districts', () => {
        const players = [
            RUN_START, { x: -570, y: 570 }, { x: 1954, y: 580 },
            { x: -226, y: 1398 }, { x: 1574, y: -252 },
        ];
        for (const [i, player] of players.entries()) {
            expect(walkable(player)).toBe(true);
            const rnd = seededRandom(2024 + i);
            const mobs = Array.from({ length: 24 }, () => spawnPoint(player, rnd));
            expect(mobs.every(Boolean)).toBe(true);
            for (const p of mobs) {
                expect(walkable(p!, 24)).toBe(true);
                const separation = Math.hypot(p!.x - player.x, p!.y - player.y);
                expect(separation).toBeGreaterThanOrEqual(260);
                expect(separation).toBeLessThanOrEqual(640.01);
            }
            const replay = seededRandom(2024 + i);
            expect(Array.from({ length: 24 }, () => spawnPoint(player, replay)))
                .toEqual(mobs);
        }
    });

    it('does not alter hero/weapon/boss stats or the three-character roster', async () => {
        const { HEROES, WAVES } = await import('../src/game/catalog/content');
        expect(HEROES.map(h => h.id)).toEqual(['sigma', 'cool-kid', 'alpha']);
        expect(WAVES).toHaveLength(5);
        const r = new Run('alpha', 2026);
        r.wave = 5;
        r.time = 900;
        r.nextSpawn = Number.POSITIVE_INFINITY;
        r.update(.025);
        expect(r.boss?.x).toBe(BOSS_ENTRY.x);
        expect(r.boss?.y).toBe(BOSS_ENTRY.y);
    });
});
