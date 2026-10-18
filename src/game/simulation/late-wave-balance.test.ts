import { describe, expect, it } from 'vitest';
import { WAVES, WAVE_SECONDS, BOSS_START, BERSERK_AFTER, HEROES } from '../catalog/content';
import { ENEMIES, EVENTS, type EnemyKind } from '../catalog/enemies';
import { PING_SNIPER_SHOT_INTERVAL } from './enemies';
import { weightedSpawnPool } from './spawn-weights';
import { Run } from './run';

const available = (wave: number) => (Object.keys(ENEMIES) as EnemyKind[])
    .filter(kind => !ENEMIES[kind].boss && kind !== 'terminal' && ENEMIES[kind].wave <= wave);

describe('phase 4.18: late-wave survival pressure', () => {
    it('keeps difficulty rising while softening the wave 3–5 damage and density spikes', () => {
        expect(WAVES.map(wave => [wave.damage, wave.density])).toEqual([
            [.8, .9], [.88, 1], [1.15, 1.28], [1.35, 1.48], [1.58, 1.72],
        ]);
        for (let wave = 1; wave < WAVES.length; wave++) {
            expect(WAVES[wave].hp).toBeGreaterThan(WAVES[wave - 1].hp);
            expect(WAVES[wave].damage).toBeGreaterThan(WAVES[wave - 1].damage);
            expect(WAVES[wave].density).toBeGreaterThan(WAVES[wave - 1].density);
        }
        expect(WAVES.map(w => [...w.weights])).toEqual([
            [90, 10, 0], [70, 28, 2], [45, 45, 10], [25, 50, 25], [10, 50, 40],
        ]);
        expect(WAVE_SECONDS).toBe(180);
        expect(EVENTS.map(event => event.at)).toEqual([195, 375, 555, 735]);
        expect(BOSS_START).toBe(900);
        expect(BERSERK_AFTER).toBe(180);
        expect(ENEMIES.boss.hp).toBe(30000);
    });

    it('preserves first and second wave enemy composition', () => {
        expect(weightedSpawnPool(available(1).filter(k => k !== 'hater'), 1, 40)).toEqual(['npc']);
        const first = weightedSpawnPool(available(1), 1, 95);
        expect(first).toHaveLength(8);
        expect(first.filter(k => k === 'hater')).toHaveLength(1);
        const second = weightedSpawnPool(available(2), 2, 205);
        expect(second.filter(k => k === 'hater')).toHaveLength(1);
        expect(second).toHaveLength(9);
    });

    for (const wave of [3, 4, 5]) {
        it(`wave ${wave} halves the relative frequency of the highest-pressure specials`, () => {
            const pool = available(wave);
            const weighted = weightedSpawnPool(pool, wave, wave * 180 - 90);
            for (const kind of pool) {
                expect(weighted.filter(k => k === kind)).toHaveLength(
                    kind === 'doomscroller' || kind === 'ping-sniper' || kind === 'hater' ? 1 : 2
                );
            }
            expect(weighted.every(k => pool.includes(k))).toBe(true);
            expect(weighted.filter(k => k === 'hater')).toHaveLength(1);
            expect(weighted.filter(k => k === 'doomscroller')).toHaveLength(1);
            if (wave >= 4) expect(weighted.filter(k => k === 'ping-sniper')).toHaveLength(1);
        });
    }

    it('uses the six-second sniper attack cooldown specified in the GDD', () => {
        expect(PING_SNIPER_SHOT_INTERVAL).toBe(6);
        expect(ENEMIES['ping-sniper']).toMatchObject({ hp: 60, speed: 40, damage: 24, xp: 12 });
        expect(ENEMIES['doomscroller']).toMatchObject({ hp: 70, speed: 50, damage: 8, xp: 12 });
    });

    for (const hero of HEROES) {
        it(`${hero.name} receives adjusted regular damage but unchanged event-boss scaling`, () => {
            const run = new Run(hero.id, 41801);
            run.time = 378;
            run.wave = 3;
            const normal = run.spawn('doomscroller', { x: 900, y: 600 });
            const major = run.spawn('mod-supremo', { x: 950, y: 600 });
            expect(normal).toBeDefined();
            expect(normal!.hp).toBeCloseTo(70 * 1.65);
            expect(normal!.damage).toBeCloseTo(8 * 1.15);
            expect(major!.hp).toBe(3200);
            expect(major!.damage).toBe(28);

            run.wave = 4;
            const sniper = run.spawn('ping-sniper', { x: 900, y: 620 });
            expect(sniper!.hp).toBeCloseTo(60 * 2.05);
            expect(sniper!.damage).toBeCloseTo(24 * 1.35);
        });
    }
});
