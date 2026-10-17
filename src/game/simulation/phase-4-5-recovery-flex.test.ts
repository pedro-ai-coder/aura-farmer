import { describe, expect, it } from 'vitest';
import { Run } from './run';

const heroes = ['sigma', 'cool-kid', 'alpha'] as const;

describe('phase 4–5: character-specific QA for approved recovery and Flex', () => {
    for (const hero of heroes) {
        it(`${hero} heals at Safe Spot once, then obeys its active-time cooldown`, () => {
            const run = new Run(hero, 4501);
            run.nextSpawn = Infinity;
            run.pos = { x: run.safeSpot.x, y: run.safeSpot.y };
            run.hp = run.maxHp / 2;
            for (let i = 0; i < 9; i++) run.update(.25);
            expect(run.safeSpotUses).toBe(1);
            expect(run.hp).toBeCloseTo(run.maxHp * .75, 4);
            const hp = run.hp;
            const ready = run.safeSpotReadyAt;
            for (let i = 0; i < 8; i++) run.update(.25);
            expect(run.safeSpotUses).toBe(1);
            expect(run.hp).toBe(hp);
            expect(ready).toBeGreaterThan(run.time);
        });

        it(`${hero} collects Snack and Magnet exactly once without duplicating XP`, () => {
            const run = new Run(hero, 4502);
            run.nextSpawn = Infinity;
            run.hp = run.maxHp / 2;
            run.drops.push(
                { id: 1001, x: run.pos.x, y: run.pos.y, xp: 0, kind: 'snack' },
                { id: 1002, x: run.pos.x, y: run.pos.y, xp: 0, kind: 'magnet' },
                { id: 1003, x: run.pos.x + 90, y: run.pos.y, xp: 8 },
                { id: 1004, x: run.pos.x + 120, y: run.pos.y, xp: 11 },
            );
            run.update(1 / 60);
            expect(run.hp).toBeCloseTo(run.maxHp * .68, 4);
            expect(run.xpCollected).toBe(19);
            expect(run.drops).toHaveLength(0);
            run.update(1 / 60);
            expect(run.xpCollected).toBe(19);
        });

        it(`${hero} activates Flex once at full Aura and cannot spend it twice`, () => {
            const run = new Run(hero, 4503);
            const target = run.spawn('npc', { x: run.pos.x + 50, y: run.pos.y });
            expect(target).toBeDefined();
            if (!target) throw new Error('Expected a valid nearby enemy');
            target.born = run.time;
            run.aura = 100;
            expect(run.activateFlex()).toBe(true);
            expect(run.flexCount).toBe(1);
            expect(run.aura).toBe(0);
            expect(run.activeFlex).toBe(true);
            expect(run.activateFlex()).toBe(false);
            expect(run.flexCount).toBe(1);
            run.pause();
            const paused = run.time;
            run.update(.25);
            expect(run.time).toBe(paused);
        });
    }
});
