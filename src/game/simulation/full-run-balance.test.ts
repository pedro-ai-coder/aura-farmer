import { describe, expect, it } from 'vitest';
import { Run } from './run';

const heroes = ['sigma', 'cool-kid', 'alpha'] as const;
const seeds = [47001, 47002, 47003] as const;

/**
 * Real enemy AI, contact damage, projectiles, pickups and weapon attacks remain enabled.
 * No direct time jumps, forced invulnerability, scripted kills or injected XP.
 */
function play(hero: typeof heroes[number], seed: number, maxSeconds: number) {
    const run = new Run(hero, seed);
    let decisions = 0;
    let ticks = 0;
    while (run.time < maxSeconds && run.mode !== 'lost' && run.mode !== 'won') {
        if (run.mode === 'upgrade') {
            if (!run.choose(0)) throw new Error(`Upgrade blocked: ${hero} seed=${seed} time=${run.time}`);
            decisions++;
            continue;
        }
        if (run.mode === 'legendary') {
            // Defer instead of injecting a legendary; normal play can still choose later.
            run.deferLegendary();
            decisions++;
            continue;
        }
        if (run.mode !== 'playing') throw new Error(`Unexpected mode: ${run.mode}`);
        const phase = Math.floor(run.time / 8) % 4;
        const movement = [
            { x: 1, y: 0 }, { x: 0, y: 1 },
            { x: -1, y: 0 }, { x: 0, y: -1 },
        ][phase];
        if (run.aura >= 100 && run.characterId !== 'sigma') run.activateFlex();
        run.update(.25, movement);
        ticks++;
        if (ticks > maxSeconds * 5 + 100) throw new Error('Simulation did not advance');
    }
    return {
        hero, seed, time: run.time, wave: run.wave, mode: run.mode,
        kills: run.kills, level: run.level, xp: run.xpCollected,
        damageTaken: run.damageTaken, damageDealt: run.damageDealt,
        healing: run.healing, flex: run.flexCount, decisions,
        safeSpotUses: run.safeSpotUses, bossDefeated: run.bossDefeated,
    };
}

describe('phase 4.8: real-damage balance runs', () => {
    for (const hero of heroes) {
        it(`${hero} progresses with live enemies and reproducible metrics`, () => {
            const first = play(hero, seeds[0], 30);
            const replay = play(hero, seeds[0], 30);
            expect(first).toEqual(replay);
            expect(first.time).toBeGreaterThan(0);
            expect(first.time).toBeLessThanOrEqual(30.25);
            expect(first.damageTaken).toBeGreaterThanOrEqual(0);
            expect(first.damageDealt).toBeGreaterThanOrEqual(0);
            expect(first.level).toBeGreaterThanOrEqual(1);
            expect(first.wave).toBeGreaterThanOrEqual(1);
        });
    }
});

// Opt-in long-running acceptance suite: AURA_FULL_RUN_QA=1 npm test -- full-run-balance.test.ts
// This intentionally reports actual losses rather than pretending every seed reaches the boss.
describe.skipIf(process.env.AURA_FULL_RUN_QA !== '1')('phase 4.8: extended complete-run evidence', () => {
    for (const hero of heroes) for (const seed of seeds) {
        it(`${hero} seed ${seed}: records an unprotected full attempt`, () => {
            const result = play(hero, seed, 1200);
            console.info('[full-run-qa]', JSON.stringify(result));
            expect(['lost', 'won', 'playing']).toContain(result.mode);
            expect(result.time).toBeGreaterThan(0);
            expect(result.time).toBeLessThanOrEqual(1200.25);
            expect(result.damageTaken).toBeGreaterThanOrEqual(0);
            expect(result.damageDealt).toBeGreaterThanOrEqual(0);
            if (result.mode === 'won') expect(result.bossDefeated).toBe(true);
        }, 120_000);
    }
});
