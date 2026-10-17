import { describe, expect, it } from 'vitest';
import { HEROES, PASSIVES, WEAPONS } from '../catalog/content';
import { Run } from './run';

describe('phase 4.10: combat balance guardrails', () => {
    it('offers an AOE weapon for every hero role', () => {
        for (const hero of HEROES) {
            const aoe = WEAPONS.filter(w => w.role === hero.role && ['blast', 'cone', 'pulse'].includes(w.shape));
            expect(aoe.length, hero.name).toBeGreaterThan(0);
            expect(aoe.some(w => w.range >= 100), hero.name).toBe(true);
        }
    });

    it('keeps healing, max-HP and damage-reduction options in the shared pool', () => {
        for (const id of ['built-different', 'thick-skin', 'certified-w'])
            expect(PASSIVES.some(p => p.id === id && !p.role)).toBe(true);
    });

    for (const hero of HEROES) {
        it(`${hero.id}: a shield absorbs damage without increasing health or exceeding the cap`, () => {
            const run = new Run(hero.id, 77001);
            const hp = run.hp;
            run.addShield('balance-guard', run.maxHp * .2, 5);
            const shield = run.shield;
            expect(shield).toBeGreaterThan(0);
            expect(shield).toBeLessThanOrEqual(run.maxHp * .4);
            run.hurt(shield * .5, undefined);
            expect(run.hp).toBe(hp);
            expect(run.protection).toBeCloseTo(shield * .5);
            expect(run.damageTaken).toBe(0);
            run.hurt(shield * 2, undefined);
            expect(run.hp).toBeLessThan(hp);
            expect(run.damageTaken).toBeGreaterThan(0);
        });

        it(`${hero.id}: defensive equipment reduces identical incoming damage`, () => {
            const bare = new Run(hero.id, 77002);
            const armored = new Run(hero.id, 77002);
            expect(armored.inventory.apply({
                kind: 'passive', action: 'new',
                item: { id: 'thick-skin', rarity: 'common', level: 1 },
            })).toBe(true);
            bare.hurt(20, undefined);
            armored.hurt(20, undefined);
            expect(armored.damageTaken).toBeLessThan(bare.damageTaken);
            expect(armored.hp).toBeGreaterThan(bare.hp);
        });
    }
});
