import { describe, expect, it } from 'vitest';
import { Run } from './run';

const heroes = ['sigma', 'cool-kid', 'alpha'] as const;

/** Fixed inputs and seeds: real simulation ticks, weapon/enemy logic and damage enabled. */
function sample(hero: typeof heroes[number], seed: number) {
    const run = new Run(hero, seed);
    const trace: Array<{ time: number; hp: number; kills: number; xp: number; damage: number }> = [];
    for (let second = 0; second < 12 && run.mode === 'playing'; second++) {
        for (let frame = 0; frame < 60 && run.mode === 'playing'; frame++)
            run.update(1 / 60, { x: second % 4 < 2 ? 1 : -1, y: 0 });
        trace.push({
            time: Number(run.time.toFixed(4)),
            hp: Number(run.hp.toFixed(4)),
            kills: run.kills,
            xp: run.xpCollected,
            damage: Number(run.damageTaken.toFixed(4)),
        });
    }
    return { run, trace };
}

describe('phase 4–5: reproducible real-damage simulation', () => {
    for (const hero of heroes) {
        it(`${hero} runs deterministic combat with real damage enabled`, () => {
            const first = sample(hero, 20261017);
            const second = sample(hero, 20261017);
            expect(first.trace).toEqual(second.trace);
            expect(first.trace.length).toBeGreaterThan(0);
            expect(first.run.inventory.weapons).toHaveLength(1);
            expect(first.run.hp).toBeGreaterThanOrEqual(0);
            expect(first.run.hp).toBeLessThanOrEqual(first.run.maxHp);
            expect(first.run.damageTaken).toBeGreaterThanOrEqual(0);
            expect(first.run.kills).toBeGreaterThanOrEqual(0);
            expect(first.run.xpCollected).toBeGreaterThanOrEqual(0);
        });

        it(`${hero} applies damage, freezes pause and records defeat`, () => {
            const run = new Run(hero, 17);
            run.update(1 / 60);
            const before = run.hp;
            run.hurt(10, undefined);
            expect(run.hp).toBeLessThan(before);
            expect(run.damageTaken).toBeGreaterThan(0);
            run.pause();
            const time = run.time;
            run.update(.25);
            expect(run.time).toBe(time);
            run.resume();
            run.hurt(run.maxHp * 100, undefined);
            expect(run.mode).toBe('lost');
            expect(run.hp).toBe(0);
            run.update(.25);
            expect(run.time).toBe(time);
        });

        it(`${hero} collects XP and pauses on an upgrade choice`, () => {
            const run = new Run(hero, 23);
            run.gainXp(100);
            run.openPending();
            expect(run.level).toBeGreaterThan(1);
            expect(run.xpCollected).toBe(100);
            expect(run.mode).toBe('upgrade');
            expect(run.choices.length).toBeGreaterThan(0);
            const time = run.time;
            run.update(.25);
            expect(run.time).toBe(time);
        });
    }
});
