import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HeroAnimator, heroPose } from '../src/browser/hero-animation';
import { HERO_FRAME_EDGE_MATTE, heroFrameTexture } from '../src/browser/hero-frame-mattes';
import frames from '../src/browser/hero-frames.json';
import flexFrames from '../src/browser/hero-flex-frames.json';
import rear from '../src/browser/hero-rear-frames.json';
import { Run } from '../src/game/simulation/run';
const heroes = ['sigma', 'cool-kid', 'alpha'] as const;

describe('authored hero pose playback', () => {
    it('extracts all seven overlapping approved frames with original atlas bounds', () => {
        let cleaned = 0;
        for (const [hero, specs] of Object.entries(HERO_FRAME_EDGE_MATTE)) {
            const spriteFrames = frames[hero as keyof typeof frames];
            for (const [id, edges] of Object.entries(specs)) {
                const n = Number(id);
                const box = spriteFrames[n];
                expect(box).toBeDefined();
                expect(edges.left + edges.right).toBeGreaterThan(0);
                expect(edges.left + edges.right).toBeLessThan(box[2] / 3);
                expect(heroFrameTexture(hero, 'atlas', n))
                    .toEqual({ key: `${hero}-matte-${n}` });
                cleaned++;
            }
        }
        expect(cleaned).toBe(7);
        expect(heroFrameTexture('sigma', 'atlas', 34))
            .toEqual({ key: 'sigma-atlas', frame: 34 });
        expect(heroFrameTexture('cool-kid', 'rear-v2', 2))
            .toEqual({ key: 'cool-kid-rear-v2', frame: 2 });
        expect(heroFrameTexture('cool-kid', 'flex-v2', 5))
            .toEqual({ key: 'cool-kid-flex-v2', frame: 5 });
    });
    it('keeps locomotion independent of automatic aim', () => {
        const r = new Run('sigma');
        r.moving = true; r.time = 1; r.movementFacing = -Math.PI / 2; r.facing = 0;
        expect(heroPose(r).frame).toBe(25);
    });
    for (const id of heroes) {
        it(`${id}: running frames and mirroring never depend on auto-aim direction`, () => {
            const r = new Run(id);
            r.moving = true;
            for (let dir = 0; dir < 8; dir++) {
                r.movementFacing = dir * Math.PI / 4;
                for (let step = 0; step < 4; step++) {
                    const playback = { walk: (step + .1) / 9, defeat: 0 };
                    r.facing = 0;
                    const eastAim = heroPose(r, playback);
                    r.facing = Math.PI;
                    const westAim = heroPose(r, playback);
                    expect(eastAim).toEqual(westAim);
                    const expectedMirror = id === 'sigma' ? dir === 5 : dir === 4;
                    expect(eastAim.flip).toBe(expectedMirror);
                    expect(eastAim.state).toBe('run');
                }
            }
        });
    }
    it('retains independent aim when stationary without changing the frame state', () => {
        const run = new Run('sigma');
        run.moving = false;
        run.facing = 0;
        const lookingEast = heroPose(run);
        run.facing = Math.PI;
        const lookingWest = heroPose(run);
        expect(lookingEast.state).toBe('idle');
        expect(lookingEast.frame).toBe(lookingWest.frame);
        expect(lookingEast.flip).toBe(false);
        expect(lookingWest.flip).toBe(true);
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
            const r = new Run(id); r.flexUntil = r.hero.duration; r.moving = true;
            r.time = 0; expect(heroPose(r).state).toBe('flex-in');
            const seen = new Set<number>();
            for (let t = 0; t < r.hero.duration; t += .05) { r.time = t; seen.add(heroPose(r).frame); }
            expect(seen.size).toBeGreaterThanOrEqual(6);
            r.time = r.hero.duration - .05; expect(heroPose(r).state).toBe('flex-out');
            r.time = r.hero.duration; r.moving = false; expect(heroPose(r).state).toBe('idle');
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
    it('loads eight distinct padded transformation frames fully inside the new PNG', () => {
        const png = readFileSync('public/assets/runtime/cool-kid-flex-v2.png');
        expect(flexFrames).toHaveLength(8);
        for (const [x, y, w, h] of flexFrames) {
            expect(x).toBeGreaterThanOrEqual(0); expect(y).toBeGreaterThanOrEqual(0);
            expect(x + w).toBeLessThanOrEqual(png.readUInt32BE(16));
            expect(y + h).toBeLessThanOrEqual(png.readUInt32BE(20));
        }
    });
    it('keeps Cool Kid transformed when hurt and restores normal art after Flex', () => {
        const r = new Run('cool-kid'); r.time = 2; r.flexUntil = 5; r.timers.hurtUntil = 2.1;
        expect(heroPose(r)).toMatchObject({ sheet: 'flex-v2', frame: 6, state: 'hurt' });
        r.time = 5; expect(heroPose(r).sheet).toBe('atlas');
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
