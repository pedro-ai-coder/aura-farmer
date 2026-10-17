import { describe, expect, it } from 'vitest';
import { Run } from './run';

describe('Aura Snack English localization', () => {
    it('announces the English pickup name and restores health', () => {
        const run = new Run('sigma', 77100);
        run.hurt(30, undefined);
        const before = run.hp;
        run.drops.push({ id: run.nextId++, kind: 'snack', x: run.pos.x, y: run.pos.y, value: 0 });
        run.update(1 / 60);
        expect(run.hp).toBeGreaterThan(before);
        expect(run.message).toContain('AURA SNACK');
        expect(run.message).not.toMatch(/SNACK DE RUA|SNACK DE AURA/i);
    });
});
