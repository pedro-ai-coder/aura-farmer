import { describe, expect, it } from 'vitest';
import { BERSERK_AFTER, BOSS_START } from '../catalog/content';
import { Run } from './run';

const heroes = ['sigma', 'cool-kid', 'alpha'] as const;

describe('phase 4: wave, boss and result regression', () => {
    for (const hero of heroes) {
        it(`${hero}: advances through all five waves and spawns Big Hater once`, () => {
            const run = new Run(hero, 47001);
            // Isolate timeline transitions from enemy AI without disabling damage or changing production rules.
            run.nextSpawn = Infinity;
            for (const boundary of [180, 360, 540, 720]) {
                run.time = boundary - 1 / 60;
                run.update(1 / 60);
                // Upgrade and legendary selections pause active time until resolved.
                while (run.mode === 'upgrade' || run.mode === 'legendary') {
                    if (run.mode === 'legendary') run.deferLegendary();
                    else expect(run.choose(0)).toBe(true);
                }
                expect(run.wave).toBe(boundary / 180 + 1);
            }
            run.time = BOSS_START - 1 / 60;
            run.update(1 / 60);
            expect(run.counters.bossSpawned).toBe(1);
            expect(run.boss?.kind).toBe('boss');
            expect(run.wave).toBe(5);
            expect(run.berserk).toBe(false);
            const bossId = run.boss!.id;
            run.time = BOSS_START + BERSERK_AFTER;
            expect(run.berserk).toBe(true);
            expect(run.bossDamageMultiplier).toBeGreaterThan(1);
            expect(run.boss!.id).toBe(bossId);
        });

        it(`${hero}: boss victory stops active time and rejects further XP`, () => {
            const run = new Run(hero, 47002);
            run.nextSpawn = Infinity;
            run.time = BOSS_START - 1 / 60;
            run.update(1 / 60);
            const boss = run.boss;
            expect(boss).toBeDefined();
            // Exercise actual damage/death handling rather than assigning mode directly.
            run.hitEnemy(boss!, boss!.hp + boss!.shield + 1);
            expect(run.bossDefeated).toBe(true);
            expect(run.mode).toBe('won');
            const time = run.time;
            const xp = run.xpCollected;
            run.update(.25);
            run.gainXp(100);
            expect(run.time).toBe(time);
            expect(run.xpCollected).toBe(xp);
        });
    }
});
