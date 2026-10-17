import { describe, expect, it } from 'vitest';
import { Run } from './run';

const heroes = ['sigma', 'cool-kid', 'alpha'] as const;
const seeds = [47001, 47002, 47003] as const;
type Hero = typeof heroes[number];

type Snapshot = {
    hero: Hero; seed: number; seconds: number; wave: number; outcome: string;
    hp: number; maxHp: number; level: number; kills: number; xp: number;
    damageTaken: number; damageDealt: number; healing: number;
    flex: number; safeSpotUses: number; upgrades: number;
    bossDefeated: boolean;
};

/** An unprotected, seeded input policy; no time jumps, scripted kills, or XP injection. */
function attempt(hero: Hero, seed: number, limitSeconds: number): Snapshot {
    const run = new Run(hero, seed);
    let ticks = 0;
    let upgrades = 0;
    while (run.time < limitSeconds && run.mode !== 'won' && run.mode !== 'lost') {
        if (run.mode === 'upgrade') {
            if (!run.choose(0)) throw new Error(`Upgrade choice failed: ${hero}/${seed}`);
            upgrades++;
            continue;
        }
        if (run.mode === 'legendary') {
            run.deferLegendary();
            continue;
        }
        if (run.mode !== 'playing') throw new Error(`Unexpected mode: ${run.mode}`);
        const phase = Math.floor(run.time / 8) % 4;
        const movement = [
            { x: 1, y: 0 }, { x: 0, y: 1 },
            { x: -1, y: 0 }, { x: 0, y: -1 },
        ][phase];
        if (run.aura >= 100) run.activateFlex();
        run.update(.25, movement);
        if (++ticks > limitSeconds * 5 + 100)
            throw new Error(`Simulation stalled: ${hero}/${seed}`);
    }
    return {
        hero, seed, seconds: Number(run.time.toFixed(3)), wave: run.wave,
        outcome: run.mode, hp: Number(run.hp.toFixed(3)),
        maxHp: Number(run.maxHp.toFixed(3)), level: run.level,
        kills: run.kills, xp: run.xpCollected,
        damageTaken: Number(run.damageTaken.toFixed(3)),
        damageDealt: Number(run.damageDealt.toFixed(3)),
        healing: Number(run.healing.toFixed(3)),
        flex: run.flexCount, safeSpotUses: run.safeSpotUses,
        upgrades, bossDefeated: run.bossDefeated,
    };
}

describe('phase 4.9: nine-seed unprotected balance baseline', () => {
    for (const hero of heroes) for (const seed of seeds) {
        it(`${hero}/${seed} is deterministic and reports survival evidence`, () => {
            const first = attempt(hero, seed, 45);
            const replay = attempt(hero, seed, 45);
            expect(first).toEqual(replay);
            expect(first.seconds).toBeGreaterThan(0);
            expect(first.seconds).toBeLessThanOrEqual(45.25);
            expect(first.hp).toBeGreaterThanOrEqual(0);
            expect(first.hp).toBeLessThanOrEqual(first.maxHp);
            expect(first.damageTaken).toBeGreaterThanOrEqual(0);
            expect(first.damageDealt).toBeGreaterThanOrEqual(0);
            expect(first.kills).toBeGreaterThanOrEqual(0);
            expect(first.level).toBeGreaterThanOrEqual(1);
            if (first.outcome === 'won') expect(first.bossDefeated).toBe(true);
            console.info('[balance-baseline]', JSON.stringify(first));
        }, 30_000);
    }
});

// Opt-in complete-attempt comparison. Actual early defeats are recorded, not hidden.
// Run: AURA_FULL_RUN_QA=1 npm test -- phase-4-9-balance-validation.test.ts
describe.skipIf(process.env.AURA_FULL_RUN_QA !== '1')('phase 4.9: nine complete attempts', () => {
    for (const hero of heroes) for (const seed of seeds) {
        it(`${hero}/${seed} full attempt`, () => {
            const result = attempt(hero, seed, 1200);
            console.info('[balance-full-run]', JSON.stringify(result));
            expect(['lost', 'won', 'playing']).toContain(result.outcome);
            expect(result.seconds).toBeGreaterThan(0);
            expect(result.seconds).toBeLessThanOrEqual(1200.25);
            if (result.outcome === 'won') expect(result.bossDefeated).toBe(true);
        }, 120_000);
    }
});
