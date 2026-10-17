import { describe, expect, it } from 'vitest';
import { Inventory } from './inventory';
import { HEROES, PASSIVES, WEAPONS } from '../catalog/content';

const defensiveIds = new Set(['thick-skin', 'built-different', 'certified-w', 'big-chad', 'homie-check', 'so-back']);

describe('early-wave defensive offer availability', () => {
    for (const hero of HEROES) {
        const starter = WEAPONS.find(w => w.role === hero.role)!;
        it(`${hero.id}: every first/second-wave offer includes existing defensive equipment`, () => {
            for (const wave of [1, 2]) for (const sample of [0, .1, .5, .9, .999]) {
                const inventory = new Inventory(hero.role, starter.id);
                const choices = inventory.normalChoices(wave, () => sample);
                expect(choices).toHaveLength(3);
                expect(new Set(choices.map(c => c.item?.id)).size).toBe(3);
                expect(choices.some(c => c.kind === 'passive' && c.item && defensiveIds.has(c.item.id))).toBe(true);
                for (const choice of choices) if (choice.item)
                    expect(inventory.legal(choice.item)).toBe(true);
            }
        });
    }
    it('only references existing defensive passives', () => {
        for (const id of defensiveIds) expect(PASSIVES.some(p => p.id === id)).toBe(true);
    });
});
