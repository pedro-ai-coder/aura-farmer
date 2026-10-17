import { describe, expect, it } from 'vitest';
import { Run } from './run';
import { Inventory } from './inventory';
import { HEROES, WEAPONS } from '../catalog/content';
import { seededRandom } from './world';

function dropSample(seed: number, kills: number, elite = false) {
    const run = new Run('sigma', seed);
    for (let n = 0; n < kills; n++) {
        // Production kill logic, without extra spawns, scripted RNG or XP pickup.
        const enemy = run.spawn('npc', { x: 900, y: 610 }, elite);
        expect(enemy).toBeDefined();
        run.kill(enemy!);
    }
    return {
        snacks: run.counters.snacksSpawned ?? 0,
        magnets: run.counters.magnetsSpawned ?? 0,
        snackOnMap: run.drops.filter(d => d.kind === 'snack').length,
        magnetOnMap: run.drops.filter(d => d.kind === 'magnet').length,
        xpOnMap: run.drops.filter(d => !d.kind).length,
        totalXpOnMap: run.drops.filter(d => !d.kind).reduce((sum, d) => sum + d.xp, 0),
    };
}

describe('phase 4.16: meaningful and reproducible special drops', () => {
    it('makes both drops obtainable on ordinary kills with a bounded on-map pool', () => {
        const first = dropSample(20261018, 500);
        expect(first).toEqual(dropSample(20261018, 500));
        expect(first.snacks).toBeGreaterThanOrEqual(10);
        expect(first.magnets).toBeGreaterThanOrEqual(3);
        expect(first.snackOnMap).toBe(5);
        expect(first.magnetOnMap).toBe(5);
        expect(first.xpOnMap).toBe(500);
        expect(first.totalXpOnMap).toBe(2500);
        // Recycling special drops does not discard ordinary XP crystals.
        expect(first.snackOnMap + first.magnetOnMap).toBeLessThanOrEqual(10);
    });

    it('rewards elites more often while retaining their full XP budget', () => {
        const common = dropSample(20261018, 500);
        const elite = dropSample(20261018, 500, true);
        expect(elite.snacks).toBeGreaterThan(common.snacks);
        expect(elite.magnets).toBeGreaterThan(common.magnets);
        expect(elite.xpOnMap).toBe(500);
        expect(elite.totalXpOnMap).toBe(500 * 60);
    });

    it('Aura Snack heals and Aura Magnet collects existing XP exactly once', () => {
        const run = new Run('sigma', 31);
        run.hurt(40, undefined);
        const before = run.hp;
        run.drops.push({ x: run.pos.x, y: run.pos.y, id: run.nextId++, xp: 0, kind: 'snack' });
        run.update(1 / 60);
        expect(run.hp).toBeGreaterThan(before);
        expect(run.counters.snacksCollected).toBe(1);
        const magnet = new Run('sigma', 32);
        magnet.drops.push({ x: magnet.pos.x + 120, y: magnet.pos.y, id: magnet.nextId++, xp: 12 });
        magnet.drops.push({ x: magnet.pos.x + 140, y: magnet.pos.y, id: magnet.nextId++, xp: 18 });
        magnet.drops.push({ x: magnet.pos.x, y: magnet.pos.y, id: magnet.nextId++, xp: 0, kind: 'magnet' });
        magnet.update(1 / 60);
        expect(magnet.counters.magnetsCollected).toBe(1);
        expect(magnet.xpCollected).toBe(30);
        expect(magnet.drops).toHaveLength(0);
        magnet.update(1 / 60);
        expect(magnet.xpCollected).toBe(30);
    });
});

describe('phase 4.16: avoid repeated early upgrade cards after acquisition', () => {
    for (const hero of HEROES) {
        it(`${hero.id} retains varied legal choices once defense and AOE are equipped`, () => {
            const inv = new Inventory(hero.role, hero.starter);
            const area = WEAPONS.find(w => w.role === hero.role &&
                ['brainrot-feed', 'touch-grass', 'personal-space'].includes(w.id))!;
            expect(inv.apply({ kind: 'weapon', action: 'new',
                item: { id: area.id, rarity: 'common', level: 1 } })).toBe(true);
            expect(inv.apply({ kind: 'passive', action: 'new',
                item: { id: 'thick-skin', rarity: 'common', level: 1 } })).toBe(true);
            const sampled = new Set<string>();
            let choicesWithoutArea = 0;
            for (let seed = 1; seed <= 24; seed++) {
                const choices = inv.normalChoices(2, seededRandom(seed));
                expect(choices).toHaveLength(3);
                expect(new Set(choices.map(c => c.item?.id)).size).toBe(3);
                for (const choice of choices) if (choice.item) expect(inv.legal(choice.item)).toBe(true);
                if (!choices.some(c => c.item?.id === area.id)) choicesWithoutArea++;
                for (const choice of choices) sampled.add(choice.item?.id ?? choice.kind);
            }
            expect(choicesWithoutArea).toBeGreaterThan(0);
            expect(sampled.size).toBeGreaterThanOrEqual(6);
        });
    }
});
