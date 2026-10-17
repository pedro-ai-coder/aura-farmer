import { describe, expect, it } from 'vitest';
import { BERSERK_AFTER, BOSS_START, HEROES, WAVES, WAVE_SECONDS } from '../catalog/content';
import { ENEMIES, EVENTS } from '../catalog/enemies';
import { Run } from './run';

describe('phase 4.16: opening-wave survival tuning', () => {
    it('reduces damage and spawn density in waves one and two while keeping ramp-up intact', () => {
        expect(WAVES[0]).toMatchObject({ hp: 1, damage: .8, density: .9, weights: [90, 10, 0] });
        expect(WAVES[1]).toMatchObject({ hp: 1.3, damage: .88, density: 1, weights: [70, 28, 2] });
        for (let i = 1; i < WAVES.length; i++) {
            expect(WAVES[i].damage).toBeGreaterThan(WAVES[i - 1].damage);
            expect(WAVES[i].density).toBeGreaterThan(WAVES[i - 1].density);
        }
        expect(WAVES[2].hp).toBe(1.65);
        expect(WAVES[3].damage).toBe(1.5);
        expect(WAVES[4].damage).toBe(1.75);
    });

    it('preserves enemy HP, XP, event timings, full-run length and boss berserk', () => {
        expect(ENEMIES.npc).toMatchObject({ hp: 35, xp: 5, damage: 8 });
        expect(ENEMIES['reply-guy']).toMatchObject({ hp: 1400, xp: 120, damage: 14 });
        expect(EVENTS).toEqual([
            { at: 195, kind: 'reply-guy' },
            { at: 375, kind: 'mod-supremo' },
            { at: 555, kind: 'ohio-express' },
            { at: 735, kind: 'doomscroll-prime' },
        ]);
        expect(WAVE_SECONDS).toBe(180);
        expect(BOSS_START).toBe(900);
        expect(BERSERK_AFTER).toBe(180);
        expect(ENEMIES.boss.hp).toBe(30000);
    });

    for (const hero of HEROES) {
        it(`${hero.id}: scales mob damage down without changing base hero defense`, () => {
            const first = new Run(hero.id, 41601);
            const firstMob = first.spawn('npc', { x: 850, y: 600 });
            expect(firstMob).toBeDefined();
            expect(firstMob!.hp).toBe(35);
            expect(firstMob!.damage).toBeCloseTo(8 * .8);
            first.hurt(firstMob!.damage, firstMob);
            expect(first.damageTaken).toBeCloseTo(8 * .8 * (1 - hero.resistance));

            const second = new Run(hero.id, 41601);
            second.wave = 2;
            second.time = 200;
            const secondMob = second.spawn('npc', { x: 850, y: 600 });
            expect(secondMob).toBeDefined();
            expect(secondMob!.hp).toBeCloseTo(35 * 1.3);
            expect(secondMob!.damage).toBeCloseTo(8 * .88);
            second.hurt(secondMob!.damage, secondMob);
            expect(second.damageTaken).toBeCloseTo(8 * .88 * (1 - hero.resistance));

            const replyGuy = second.spawn('reply-guy', { x: 850, y: 700 });
            expect(replyGuy).toBeDefined();
            expect(replyGuy!.hp).toBe(1400);
            expect(replyGuy!.damage).toBe(14);
            second.hurt(replyGuy!.damage, replyGuy);
            expect(second.damageTaken).toBeCloseTo((8 * .88 + 14) * (1 - hero.resistance));
        });
    }
});
