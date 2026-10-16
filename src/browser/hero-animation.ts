import type { Run } from '../game/simulation/run';

export interface HeroPose {
    frame: number;
    flip: boolean;
    sheet: 'atlas' | 'rear-v2' | 'flex-v2';
    state: 'idle' | 'run' | 'attack' | 'hurt' | 'defeat' | 'flex-in' | 'flex-loop' | 'flex-out';
    scale: number;
}
interface Playback { walk: number; defeat: number }
const cycle = (time: number, fps: number, frames: number[]) => frames[Math.floor(Math.max(0, time) * fps) % frames.length];

/** Pure presentation: never advances combat, timers or RNG. Directions use canvas coordinates. */
export function heroPose(r: Run, playback: Playback = { walk: r.time, defeat: 1 }): HeroPose {
    const cool = r.characterId === 'cool-kid', alpha = r.characterId === 'alpha';
    const pose = (frame: number, state: HeroPose['state'], flip = Math.cos(r.facing) < 0, sheet: HeroPose['sheet'] = 'atlas'): HeroPose => ({
        frame, flip, sheet, state,
        // One scale per sheet, never per pose: preserve squat, attack reach and defeat proportions.
        scale: sheet === 'flex-v2' ? 84 / 377 : sheet === 'rear-v2' ? (alpha ? 64 / 328 : 64 / 648) : 64 / (cool ? 208 : alpha ? 171 : 176),
    });
    if (r.mode === 'lost') {
        const frames = cool ? [29, 30, 31, 32] : [37, 38, 39, 40];
        return pose(frames[Math.min(3, Math.floor(playback.defeat * 8))], 'defeat');
    }
    if (r.timers.hurtUntil > r.time) {
        if (cool && r.activeFlex) return pose(6, 'hurt', Math.cos(r.movementFacing) < 0, 'flex-v2');
        const elapsed = .18 - (r.timers.hurtUntil - r.time);
        return pose((cool ? 29 : 37) + (elapsed >= .09 ? 1 : 0), 'hurt');
    }
    if (r.activeFlex) {
        const elapsed = Math.max(0, r.hero.duration - (r.flexUntil - r.time));
        if (cool) {
            const flip = Math.cos(r.moving ? r.movementFacing : r.facing) < 0;
            if (elapsed < .25) return pose(Math.floor(elapsed * 8), 'flex-in', flip, 'flex-v2');
            if (r.flexUntil - r.time <= .25) return pose(r.flexUntil - r.time > .125 ? 6 : 7, 'flex-out', flip, 'flex-v2');
            return pose(r.moving ? cycle(playback.walk, 11.25, [2, 3, 4, 5]) : 1, 'flex-loop', flip, 'flex-v2');
        }
        if (alpha) {
            // Alpha's three simulation impacts occur at 0, 2 and 4 seconds.
            // Show impact/recovery there, then brace; never invent extra slams.
            const phase = elapsed % 2;
            const frame = phase < .125 ? 44 : phase < .25 ? 45 : phase < .4 ? 46
                : elapsed < 4 && phase > 1.875 ? 43 : elapsed < 4 && phase > 1.75 ? 41 : 42;
            if (r.flexUntil - r.time <= .25) return pose(r.flexUntil - r.time > .125 ? 46 : 47, 'flex-out');
            return pose(frame, elapsed < .4 ? 'flex-in' : 'flex-loop');
        }
        if (elapsed < .25) return pose([41, 42][Math.floor(elapsed * 8)], 'flex-in');
        if (r.flexUntil - r.time <= .25)
            return pose([46, 47][r.flexUntil - r.time > .125 ? 0 : 1], 'flex-out');
        return pose(cycle(elapsed - .25, 8, [43, 44, 45, 46]), 'flex-loop');
    }
    if (r.timers.attackUntil > r.time) {
        const elapsed = Math.max(0, .22 - (r.timers.attackUntil - r.time));
        return pose((cool ? 26 : 34) + Math.min(2, Math.floor(elapsed / (.22 / 3))), 'attack');
    }
    if (r.moving) {
        const dir = (Math.round(r.movementFacing / (Math.PI / 4)) + 8) % 8;
        const step = Math.floor(playback.walk * 9) % 4;
        if (alpha && dir >= 5) return pose(([8, 4, 0][dir - 5]) + step, 'run', false, 'rear-v2');
        if (cool && dir === 6) return pose(step, 'run', false, 'rear-v2');
        const groups = cool ? [0, 4, 8, 12, 0, 16, 0, 20]
            : alpha ? [0, 8, 16, 24, 0, 0, 0, 0]
            : [0, 4, 8, 12, 16, 20, 24, 28];
        // Sigma's two authored rear diagonals both face right; NW needs the symmetric pose.
        return pose(groups[dir] + step, 'run', ((cool || alpha) && dir === 4) || (!cool && !alpha && dir === 5));
    }
    return pose((cool ? 24 : 32) + Math.floor(r.time * 2) % 2, 'idle');
}

/** Walk clock follows actual travel. Only the death presentation continues after simulation stops. */
export class HeroAnimator {
    private run?: Run;
    private x = 0;
    private y = 0;
    private walk = 0;
    private defeat = 0;
    private lost = false;
    sample(r: Run, delta: number): HeroPose {
        if (this.run !== r) {
            this.run = r; this.x = r.pos.x; this.y = r.pos.y;
            this.walk = 0; this.defeat = 0; this.lost = false;
        }
        if (r.mode === 'playing') this.walk += Math.hypot(r.pos.x - this.x, r.pos.y - this.y) / r.hero.speed;
        if (r.mode === 'lost') {
            if (this.lost) this.defeat += Math.max(0, Math.min(delta, .1));
            this.lost = true;
        }
        this.x = r.pos.x; this.y = r.pos.y;
        return heroPose(r, { walk: this.walk, defeat: this.defeat });
    }
}
