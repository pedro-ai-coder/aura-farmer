import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { B1_HERO_IDS, B1_SPRITE_CELL, b1HeroArt } from '../src/browser/b1-hero-art';
import { heroPose } from '../src/browser/hero-animation';
import { Run } from '../src/game/simulation/run';

describe('B1 Cartoon Arcade illustrated protagonists', () => {
    it('ships three original transparent SVG sprite sheets with sixteen authored cells', () => {
        expect(B1_HERO_IDS).toEqual(['sigma', 'cool-kid', 'alpha']);
        expect(B1_SPRITE_CELL).toEqual({ width: 200, height: 224, columns: 4, rows: 4 });
        for (const id of B1_HERO_IDS) {
            const svg = readFileSync(`public/assets/cartoon/b1/${id}-hero.svg`, 'utf8');
            expect(svg).toMatch(/<svg[^>]*width="800" height="896"/);
            expect(svg.match(/<g transform="translate\(/g)).toHaveLength(16);
            expect(svg).not.toMatch(/<script|<foreignObject|<image|xlink:href|https?:\/\//i);
            expect(svg).toContain('fill="none"');
        }
    });
    for (const id of B1_HERO_IDS) {
        it(`${id} has playable idle, walking, rear view, attack and hurt art`, () => {
            const run = new Run(id);
            const idle = b1HeroArt(id, heroPose(run), 0, 0);
            expect(idle).toMatchObject({ key: `b1-${id}`, frame: 0, originY: 208 / 224 });
            expect(b1HeroArt(id, heroPose(run), 0, 1)?.frame).toBe(0);
            run.moving = true;
            run.movementFacing = 0;
            for (let stride = 0; stride < 4; stride++) {
                const pose = heroPose(run, { walk: (stride + .1) / 9, defeat: 0 });
                expect(b1HeroArt(id, pose, 0, 0)?.frame).toBe(2 + stride);
                const back = new Run(id);
                back.moving = true; back.movementFacing = -Math.PI / 2;
                const rearPose = heroPose(back, { walk: (stride + .1) / 9, defeat: 0 });
                expect(b1HeroArt(id, rearPose, -Math.PI / 2, 0)?.frame).toBe(11 + stride);
            }
            run.moving = false; run.time = 0; run.timers.attackUntil = .22;
            expect(b1HeroArt(id, heroPose(run), 0, 0)?.frame).toBe(6);
            run.timers.hurtUntil = .18;
            expect(b1HeroArt(id, heroPose(run), 0, 0)?.frame).toBe(8);
        });
        it(`${id} preserves prior authored flex and four-step defeat sequences`, () => {
            const run = new Run(id);
            run.flexUntil = run.hero.duration;
            expect(b1HeroArt(id, heroPose(run), 0, 0)).toBeUndefined();
            run.flexUntil = 0;
            run.mode = 'lost';
            expect(b1HeroArt(id, heroPose(run), 0, 0)).toBeUndefined();
        });
    }
    it('never replaces unrelated characters or simulation timing', () => {
        const run = new Run('sigma');
        const stateBefore = { time: run.time, hp: run.hp, x: run.pos.x, y: run.pos.y };
        const pose = heroPose(run);
        expect(b1HeroArt('unknown', pose, 0, run.time)).toBeUndefined();
        b1HeroArt('sigma', pose, 0, run.time);
        expect({ time: run.time, hp: run.hp, x: run.pos.x, y: run.pos.y }).toEqual(stateBefore);
    });
});
