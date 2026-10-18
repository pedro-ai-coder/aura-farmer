import { describe, expect, it } from 'vitest';
import { HEROES, BOSS_START } from '../catalog/content';
import { ENEMIES } from '../catalog/enemies';
import { walkable, clearLine } from './world';
import { Run } from './run';

describe('phase 4.19: real weapon damage against Big Hater', () => {
    for (const hero of HEROES) {
        it(`${hero.id} can hit Big Hater using only the starter weapon and normal manual aim`, () => {
            const run = new Run(hero.id, 87190);
            // This isolates the encounter; unlike the full-run suite, the test
            // does not measure survival through waves 1–5 or claim a victory.
            run.wave = 5;
            run.time = BOSS_START + 1;
            run.counters.bossSpawned = 1;
            const boss = run.spawn('boss', { x: 724, y: 445 });
            expect(boss).toBeDefined();
            expect(boss!.maxHp).toBe(ENEMIES.boss.hp);
            run.pos = { x: hero.role === 'ranged' ? 900 : 810, y: 445 };
            expect(walkable(run.pos)).toBe(true);
            expect(clearLine(run.pos, boss!)).toBe(true);
            run.time = boss!.born;

            const hpBefore = boss!.hp;
            for (let n = 0; n < 12 && run.mode === 'playing'; n++)
                run.update(.25, { x: 0, y: 0, manual: true, aim: { x: boss!.x, y: boss!.y } });

            expect(boss!.hp).toBeLessThan(hpBefore);
            expect(boss!.hp).toBeGreaterThan(0);
            expect(run.bossDefeated).toBe(false);
            expect(run.mode).toBe('playing');
        });
    }
});
