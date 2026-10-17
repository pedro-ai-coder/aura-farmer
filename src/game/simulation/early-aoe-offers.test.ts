import { describe, expect, it } from 'vitest';
import { Inventory } from './inventory';
import { HEROES, WEAPONS } from '../catalog/content';

const areaIds = new Set(['brainrot-feed', 'touch-grass', 'personal-space']);
const defensiveIds = new Set(['thick-skin', 'built-different', 'certified-w', 'big-chad', 'homie-check', 'so-back']);

describe('phase 4.13: opening-wave defensive and area-clear choices', () => {
    for (const hero of HEROES) {
        it(`${hero.id}: every early offer contains defense and role-specific area damage`, () => {
            const starter = WEAPONS.find(w => w.role === hero.role);
            expect(starter).toBeDefined();
            for (const wave of [1, 2]) for (const sample of [0, .01, .25, .5, .75, .99]) {
                const inventory = new Inventory(hero.role, starter!.id);
                const offers = inventory.normalChoices(wave, () => sample);
                expect(offers).toHaveLength(3);
                expect(new Set(offers.map(c => c.item?.id)).size).toBe(3);
                expect(offers.some(c => c.kind === 'passive' && c.item && defensiveIds.has(c.item.id))).toBe(true);
                expect(offers.some(c => c.kind === 'weapon' && c.item && areaIds.has(c.item.id))).toBe(true);
                for (const offer of offers) if (offer.item) expect(inventory.legal(offer.item)).toBe(true);
            }
        });
    }
});
