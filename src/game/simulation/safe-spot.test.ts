import { describe, expect, it } from 'vitest';
import { Run } from './run';

describe('Safe Spot', () => {
    it('requires standing inside, heals once and respects cooldown', () => {
        const run = new Run('sigma', 42);
        run.pos = { x: run.safeSpot.x, y: run.safeSpot.y };
        run.hp = run.maxHp / 2;
        for (let i = 0; i < 4; i++) run.update(.25);
        expect(run.safeSpotUses).toBe(0);
        for (let i = 0; i < 5; i++) run.update(.25);
        expect(run.safeSpotUses).toBe(1);
        expect(run.hp).toBeGreaterThan(run.maxHp / 2);
        const used = run.safeSpotUses;
        run.update(1);
        expect(run.safeSpotUses).toBe(used);
        expect(run.safeSpotReadyAt).toBeGreaterThan(run.time);
    });

    it('resets charge on exit and never heals above max HP', () => {
        const run = new Run('sigma', 43);
        run.pos = { x: run.safeSpot.x, y: run.safeSpot.y };
        run.hp = run.maxHp - 1;
        for (let i = 0; i < 4; i++) run.update(.25);
        run.pos = { x: 724, y: 610 };
        run.update(1 / 60);
        expect(run.safeSpotCharge).toBe(0);
        run.pos = { x: run.safeSpot.x, y: run.safeSpot.y };
        for (let i = 0; i < 4; i++) run.update(.25);
        expect(run.safeSpotUses).toBe(0);
        for (let i = 0; i < 5; i++) run.update(.25);
        expect(run.hp).toBeLessThanOrEqual(run.maxHp);
    });
});
