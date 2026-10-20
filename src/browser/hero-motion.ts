import type { Run } from '../game/simulation/run';
import type { HeroPose } from './hero-animation';

export interface HeroTransform {
    /** Sprite-only displacement: logical Run position/hitbox never change. */
    shiftX: number;
    lift: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
}

const REST: HeroTransform = { shiftX: 0, lift: 0, rotation: 0, scaleX: 1, scaleY: 1 };
const blend = (from: number, to: number, t: number) => from + (to - from) * t;
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

/**
 * Lightweight presentation polish for the existing approved Option A PNGs.
 * Footsteps follow actual displacement; attacks and hurts use real deadlines.
 * Pause/choices freeze secondary motion, and Reduce Motion disables it.
 */
export class HeroMotionAnimator {
    private run?: Run;
    private x = 0;
    private y = 0;
    private distance = 0;
    private visual: HeroTransform = { ...REST };

    sample(r: Run, pose: HeroPose, delta: number): HeroTransform {
        if (this.run !== r) {
            this.run = r;
            this.x = r.pos.x;
            this.y = r.pos.y;
            this.distance = 0;
            this.visual = { ...REST };
        }
        const dx = r.pos.x - this.x, dy = r.pos.y - this.y;
        this.x = r.pos.x;
        this.y = r.pos.y;

        if (r.reduceMotion) {
            this.visual = { ...REST };
            return { ...this.visual };
        }
        if (r.mode !== 'playing' && r.mode !== 'lost' && r.mode !== 'won') {
            return { ...this.visual };
        }

        const dt = clamp(delta, 0, .1);
        const displacement = r.mode === 'playing'
            ? Math.min(Math.hypot(dx, dy), r.hero.speed * dt * 1.3) : 0;
        if (pose.state === 'run' && displacement > .2) this.distance += displacement;

        const target: HeroTransform = { ...REST };
        const running = pose.state === 'run' && r.mode === 'playing' && displacement > .4;
        if (running) {
            const phase = this.distance * 9 / Math.max(1, r.hero.speed) * Math.PI / 2;
            const step = Math.abs(Math.sin(phase));
            target.lift = 2.3 * step;
            target.rotation = .045 * dx / Math.max(.001, Math.hypot(dx, dy));
            target.scaleX = 1 + .021 * step;
            target.scaleY = 1 - .023 * step;
        } else if (pose.state === 'idle' && r.mode === 'playing') {
            // Subtle breathing beneath the existing authored two-frame idle.
            const breathing = Math.sin(r.time * Math.PI * 2 * 1.25);
            target.scaleX = 1 - .006 * breathing;
            target.scaleY = 1 + .013 * breathing;
        } else if (pose.state === 'attack') {
            const progress = clamp((r.time - (r.timers.attackUntil - .22)) / .22, 0, 1);
            const swing = Math.sin(progress * Math.PI);
            const side = Math.cos(r.facing) < 0 ? -1 : 1;
            target.rotation = side * .065 * swing;
            target.scaleX = 1 + .04 * swing;
            target.scaleY = 1 - .036 * swing;
            target.shiftX = -side * 1.8 * swing;
        } else if (pose.state === 'hurt') {
            const progress = clamp((.18 - (r.timers.hurtUntil - r.time)) / .18, 0, 1);
            const jolt = Math.sin(Math.PI * progress);
            const side = Math.cos(r.facing) < 0 ? -1 : 1;
            target.rotation = -side * .075 * jolt;
            target.shiftX = -side * 2.1 * jolt;
            target.scaleX = 1 - .035 * jolt;
            target.scaleY = 1 + .028 * jolt;
        } else if (pose.state.startsWith('flex')) {
            // Does not add fictional Alpha impacts or other combat effects.
            const pulse = (1 + Math.sin(r.time * Math.PI * 4)) / 2;
            target.scaleX = 1 + .019 * pulse;
            target.scaleY = 1 + .019 * pulse;
        }

        // Frame-rate-independent ease into stance, recoil, and rest.
        // Blocked movement settles visually because no distance is covered.
        const ease = 1 - Math.exp(-18 * dt);
        this.visual = {
            shiftX: blend(this.visual.shiftX, target.shiftX, ease),
            lift: blend(this.visual.lift, target.lift, ease),
            rotation: blend(this.visual.rotation, target.rotation, ease),
            scaleX: blend(this.visual.scaleX, target.scaleX, ease),
            scaleY: blend(this.visual.scaleY, target.scaleY, ease),
        };
        return { ...this.visual };
    }
}
