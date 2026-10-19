import frames from './enemy-frames.json';
import { ENEMIES } from '../game/catalog/enemies';
import type { Enemy } from '../game/simulation/types';
import type { Run } from '../game/simulation/run';
export type EnemyPoseState = 'idle' | 'move' | 'windup' | 'impact' | 'recover' | 'hurt' | 'stagger' | 'death';
export interface EnemyPose {
    enemy: Enemy; sheet: string; frame: string | number; state: EnemyPoseState;
    scale: number; originX: number; originY: number; flip: boolean; alpha: number;
}
export function enemyPose(e: Enemy, time: number, walk: number, moving: boolean, berserk: boolean, deathAge?: number): EnemyPose {
    const kind = e.kind === 'boss' && berserk ? 'boss-berserk' : e.kind;
    const data = frames[kind as keyof typeof frames];
    let state: EnemyPoseState = moving ? 'move' : 'idle';
    let index = moving ? Math.floor(walk) % 4 : 0;
    let angle = e.angle;
    const a = e.attackPose;
    if (a && time >= a.start && time < a.end) {
        angle = a.angle;
        state = time < a.impact ? 'windup' : time < a.end - .22 ? 'impact' : 'recover';
        // Frame 4 is an authored anticipation pose. Returning to it during
        // recovery looked like a second attack was about to fire. Release back
        // into the neutral pose after the frame-5 impact instead.
        index = state === 'windup' ? 4 : state === 'impact' ? 5 : 0;
    }
    // Telegraph/impact has priority over damage feedback, so repeated hits cannot hide an attack.
    if ((!a || time >= a.end) && time - e.hurtAt < .16) { state = 'hurt'; index = 6; }
    if (e.staggerUntil > time) { state = 'stagger'; index = 6; }
    if (deathAge !== undefined) { state = 'death'; index = deathAge < .16 ? 6 : 7; }
    const size = ENEMIES[e.kind].boss ? e.radius * 2.6 : e.radius * 3.1;
    if (!data) return { enemy: e, sheet: 'enemy-atlas', frame: 13, state, scale: size / 256, originX: .5, originY: 1, flip: false, alpha: deathAge === undefined ? 1 : Math.max(0, 1 - deathAge / .8) };
    const [, , w, h, px, py] = data.frames[index];
    return { enemy: e, sheet: data.sheet, frame: `${kind}:${index}`, state, scale: size / data.height,
        originX: px / w, originY: py / h, flip: Math.cos(angle) < -.05,
        alpha: deathAge === undefined ? 1 : Math.max(0, Math.min(1, (.85 - deathAge) / .3)) };
}
/** Runs on simulation time; only the last boss fall continues after victory. */
export class EnemyAnimator {
    private run?: Run;
    private walk = new Map<number, { x: number; y: number; phase: number }>();
    private finishAge = 0;
    private previous: EnemyPose[] = [];
    sample(r: Run, dt: number): EnemyPose[] {
        if (r !== this.run) { this.reset(); this.run = r; }
        if (r.mode !== 'playing' && r.mode !== 'won' && this.previous.length) return this.previous;
        if (r.mode === 'won') this.finishAge += Math.min(Math.max(dt, 0), .1);
        const poses: EnemyPose[] = [], alive = new Set<number>();
        for (const e of r.enemies) {
            if (e.born > r.time) continue;
            alive.add(e.id);
            const old = this.walk.get(e.id) ?? { x: e.x, y: e.y, phase: 0 };
            const distance = Math.hypot(e.x - old.x, e.y - old.y);
            const phase = old.phase + distance / Math.max(5, ENEMIES[e.kind].speed / 9);
            this.walk.set(e.id, { x: e.x, y: e.y, phase });
            poses.push(enemyPose(e, r.time, phase, distance > .001, e.kind === 'boss' && r.berserk));
        }
        for (const id of this.walk.keys()) if (!alive.has(id)) this.walk.delete(id);
        for (const d of r.defeatedEnemies) {
            const age = r.time - d.at + (r.mode === 'won' ? this.finishAge : 0);
            if (age < .85) poses.push(enemyPose(d.enemy, r.time, 0, false, d.berserk, age));
        }
        this.previous = poses;
        return poses;
    }
    reset() { this.walk.clear(); this.finishAge = 0; this.run = undefined; this.previous = []; }
}
