import { describe, expect, it } from 'vitest';
import { Run } from '../src/game/simulation/run';
import { HeroAnimator, heroPose } from '../src/browser/hero-animation';
import { HeroMotionAnimator } from '../src/browser/hero-motion';
import { heroFrameTexture } from '../src/browser/hero-frame-mattes';

const heroes = ['sigma', 'cool-kid', 'alpha'] as const;

describe('B1 approved-art movement and animation polish', () => {
    for (const id of heroes) {
        it(id + ': uses only approved PNG atlases', () => {
            const run = new Run(id);
            const pose = heroPose(run);
            const art = heroFrameTexture(id, pose.sheet, pose.frame);
            expect(art.key).toMatch(new RegExp('^' + id + '-(atlas|rear-v2|flex-v2|matte-)'));
            expect(art.key).not.toContain('b1-');
        });
        it(id + ': foot bounce is driven by actual travel and remains bounded', () => {
            const run = new Run(id);
            const animator = new HeroAnimator(), motion = new HeroMotionAnimator();
            run.moving = true;
            const still = motion.sample(run, animator.sample(run, .05), .05);
            expect(still.lift).toBe(0);
            expect(still.rotation).toBe(0);
            const x = run.pos.x, hp = run.hp, time = run.time;
            run.pos.x += run.hero.speed / 9;
            const pose = animator.sample(run, .09);
            const moved = motion.sample(run, pose, .09);
            expect(pose.state).toBe('run');
            expect(moved.lift).toBeGreaterThan(0);
            expect(moved.rotation).toBeGreaterThan(0);
            expect(moved.scaleX).toBeGreaterThan(1);
            expect(moved.scaleX).toBeLessThanOrEqual(1.05);
            expect(moved.scaleY).toBeGreaterThanOrEqual(.96);
            expect(run.hp).toBe(hp);
            expect(run.time).toBe(time);
            expect(run.pos.x).toBe(x + run.hero.speed / 9);
            run.moving = false;
            let settled = moved;
            for (let step = 0; step < 8; step++)
                settled = motion.sample(run, animator.sample(run, .08), .08);
            expect(settled.lift).toBeLessThan(.01);
            expect(Math.abs(settled.rotation)).toBeLessThan(.001);
        });
        it(id + ': freezes in pause/choice and respects reduced motion', () => {
            const run = new Run(id);
            const animator = new HeroAnimator(), motion = new HeroMotionAnimator();
            run.moving = true;
            motion.sample(run, animator.sample(run, .1), .1);
            run.pos.x += run.hero.speed / 9;
            const before = motion.sample(run, animator.sample(run, .1), .1);
            run.mode = 'paused';
            expect(motion.sample(run, animator.sample(run, 4), 4)).toEqual(before);
            run.mode = 'upgrade';
            expect(motion.sample(run, animator.sample(run, 4), 4)).toEqual(before);
            run.reduceMotion = true;
            expect(motion.sample(run, animator.sample(run, .1), .1)).toEqual({
                shiftX: 0, lift: 0, rotation: 0, scaleX: 1, scaleY: 1,
            });
        });
        it(id + ': attack and hurt follow existing deadlines and reset on restart', () => {
            const run = new Run(id), motion = new HeroMotionAnimator();
            run.timers.attackUntil = .22;
            motion.sample(run, heroPose(run), .08);
            run.time = .11;
            const attack = motion.sample(run, heroPose(run), .1);
            expect(attack.rotation).toBeGreaterThan(.01);
            expect(attack.scaleX).toBeGreaterThan(1.01);
            run.timers.hurtUntil = .29;
            run.time = .20;
            const hurt = motion.sample(run, heroPose(run), .1);
            expect(hurt.shiftX).toBeLessThan(0);
            const next = new Run(id);
            next.reduceMotion = true;
            expect(motion.sample(next, heroPose(next), .1)).toEqual({
                shiftX: 0, lift: 0, rotation: 0, scaleX: 1, scaleY: 1,
            });
        });
    }
    it('stabilizes eight directional poses near joystick boundary but turns promptly', () => {
        const run = new Run('sigma'), animator = new HeroAnimator();
        run.moving = true;
        run.movementFacing = 0;
        expect(animator.sample(run, .016).frame).toBe(0);
        run.movementFacing = Math.PI / 8 + .035;
        expect(animator.sample(run, .016).frame).toBe(0);
        run.movementFacing = Math.PI / 8 + .16;
        expect(animator.sample(run, .016).frame).toBe(4);
        run.moving = false;
        animator.sample(run, .016);
        run.moving = true;
        run.movementFacing = Math.PI;
        expect(animator.sample(run, .016).frame).toBe(16);
    });
    it('secondary motion cannot mutate hero hitboxes, timers or RNG', () => {
        const run = new Run('alpha');
        const before = { time: run.time, pos: { ...run.pos }, hp: run.hp, seed: run.seed };
        const motion = new HeroMotionAnimator();
        run.reduceMotion = true;
        motion.sample(run, heroPose(run), .1);
        expect({ time: run.time, pos: { ...run.pos }, hp: run.hp, seed: run.seed }).toEqual(before);
    });
});
