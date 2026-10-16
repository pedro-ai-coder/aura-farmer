import { describe, expect, it } from 'vitest';
import { Run } from './run';

describe('special drops', () => {
    it('Snack de Rua restores bounded HP and disappears on collection', () => {
        const run = new Run('sigma', 123);
        run.hp = run.maxHp / 2;
        run.drops.push({ id: 9001, x: run.pos.x, y: run.pos.y, xp: 0, kind: 'snack' });
        const before = run.hp;
        run.update(1 / 60);
        expect(run.hp).toBeGreaterThan(before);
        expect(run.hp).toBeLessThanOrEqual(run.maxHp);
        expect(run.drops.some(d => d.id === 9001)).toBe(false);
    });

    it('Aura Magnet collects all map XP once and preserves other special drops', () => {
        const run = new Run('sigma', 123);
        run.drops.push(
            { id: 9001, x: run.pos.x, y: run.pos.y, xp: 0, kind: 'magnet' },
            { id: 9002, x: run.pos.x + 90, y: run.pos.y, xp: 8 },
            { id: 9003, x: run.pos.x + 120, y: run.pos.y, xp: 11 },
            { id: 9004, x: run.pos.x + 100, y: run.pos.y, xp: 0, kind: 'snack' },
        );
        run.update(1 / 60);
        expect(run.xpCollected).toBe(19);
        expect(run.drops.map(d => d.id)).toEqual([9004]);
        run.update(1 / 60);
        expect(run.xpCollected).toBe(19);
    });
});
