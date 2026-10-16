import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HeroAnimator, heroPose } from '../src/browser/hero-animation';
import frames from '../src/browser/hero-frames.json';
import rear from '../src/browser/hero-rear-frames.json';
import { Run } from '../src/game/simulation/run';
const heroes = ['sigma', 'cool-kid', 'alpha'] as const;

describe('authored hero pose playback', () => {
    it('keeps locomotion independent of automatic aim', () => {
        const r = new Run('sigma');
        r.moving = true; r.time = 1; r.movementFacing = -Math.PI / 2; r.facing = 0;
        expect(heroPose(r).frame).toBe(25);
    });
    it('uses the actual Cool Kid death pose, not a walk frame', () => {
        const r = new Run('cool-kid'); r.mode = 'lost'; r.moving = true;
        expect(heroPose(r).frame).toBe(32);
    });
    for (const id of heroes) {
        it(`${id}: eight directions have four frames inside the actual texture`, () => {
            const r = new Run(id); r.moving = true;
            for (let dir = 0; dir < 8; dir++) {
                const poses = new Set<number>();
                for (let tick = 0; tick < 4; tick++) {
                    r.time = (tick + .1) / 9; r.movementFacing = dir * Math.PI / 4;
                    const p = heroPose(r);
                    const boxes = p.sheet === 'atlas' ? frames[id] : rear[id as keyof typeof rear];
                    const box = boxes[p.frame]; expect(box).toBeDefined(); poses.add(p.frame);
                    const png = readFileSync(`public/assets/runtime/${id}-${p.sheet}.png`);
                    expect(box[0] + box[2]).toBeLessThanOrEqual(png.readUInt32BE(16));
                    expect(box[1] + box[3]).toBeLessThanOrEqual(png.readUInt32BE(20));
                }
                expect(poses.size).toBe(4);
            }
        });
        it(`${id}: Flex has entry, sustained playback and recovery without a frozen final pose`, () => {
            const r = new Run(id); r.flexUntil = r.hero.duration;
            r.time = 0; expect(heroPose(r).state).toBe('flex-in');
            const seen = new Set<number>();
            for (let t = 0; t < r.hero.duration; t += .05) { r.time = t; seen.add(heroPose(r).frame); }
            expect(seen.size).toBeGreaterThanOrEqual(6);
            r.time = r.hero.duration - .05; expect(heroPose(r).state).toBe('flex-out');
            r.time = r.hero.duration; expect(heroPose(r).state).toBe('idle');
        });
        it(`${id}: death sequence advances while simulation remains stopped and resets on a new run`, () => {
            const animator = new HeroAnimator(), r = new Run(id); r.mode = 'lost'; r.time = 10;
            const seen = new Set<number>();
            for (let i = 0; i < 8; i++) seen.add(animator.sample(r, .1).frame);
            expect(seen.size).toBe(4); expect(r.time).toBe(10);
            expect(animator.sample(r, .1).frame).toBe(id === 'cool-kid' ? 32 : 40);
            expect(animator.sample(new Run(id), .1).state).toBe('idle');
        });
        it(`${id}: pause and collision do not advance walk frames`, () => {
            const animator = new HeroAnimator(), r = new Run(id); r.moving = true;
            const first = animator.sample(r, .1);
            r.time = 5; expect(animator.sample(r, .1)).toEqual(first);
            r.pos.x += r.hero.speed / 9 + 1; expect(animator.sample(r, .1).frame).not.toBe(first.frame);
            r.mode = 'paused'; const paused = animator.sample(r, .1);
            expect(animator.sample(r, 3)).toEqual(paused);
        });
    }
    it('uses rear art for north and correct diagonals, without flipping Cool Kid rear accessories', () => {
        for (const id of ['alpha', 'cool-kid'] as const) {
            const r = new Run(id); r.moving = true; r.movementFacing = -Math.PI / 2;
            expect(heroPose(r)).toMatchObject({ sheet: 'rear-v2', flip: false });
        }
        const r = new Run('sigma'); r.moving = true; r.movementFacing = -3 * Math.PI / 4;
        expect(heroPose(r).flip).toBe(true);
    });
    it('synchronizes Alpha impact poses with the three real slam times, never every animation loop', () => {
        const r = new Run('alpha'); r.flexUntil = 6;
        for (const t of [0, 2, 4]) { r.time = t; expect(heroPose(r).frame).toBe(44); }
        for (const t of [1, 3, 5]) { r.time = t; expect(heroPose(r).frame).toBe(42); }
    });
    it('shows attack and hurt frames in order without changing the simulation', () => {
        const r = new Run(); r.timers.attackUntil = .22;
        const before = JSON.stringify(r);
        expect(heroPose(r).frame).toBe(34); expect(JSON.stringify(r)).toBe(before);
        r.time = .08; expect(heroPose(r).frame).toBe(35);
        r.time = .16; expect(heroPose(r).frame).toBe(36);
        r.timers.hurtUntil = .34; expect(heroPose(r).frame).toBe(37);
        r.time = .26; expect(heroPose(r).frame).toBe(38);
    });
});
