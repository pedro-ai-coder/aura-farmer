import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EnemyAnimator, enemyPose } from '../src/browser/enemy-animation';
import frames from '../src/browser/enemy-frames.json';
import { ENEMIES, type EnemyKind } from '../src/game/catalog/enemies';
import { Run } from '../src/game/simulation/run';
import { cueEnemyAttack, updateEnemies } from '../src/game/simulation/enemies';

const fixture = (kind: EnemyKind = 'hater') => {
    const r = new Run('sigma', 42); r.time = 10;
    const e = r.spawn(kind, { x: 650, y: 500 })!; e.born = 0; return { r, e };
};
describe('enemy animation presentation', () => {
    for (const [kind, data] of Object.entries(frames)) it(`${kind} has eight distinct valid source rectangles and stable pivots`, () => {
        const png = readFileSync(`public/assets/runtime/${data.sheet}.png`);
        expect(data.frames).toHaveLength(8);
        expect(new Set(data.frames.map(f => f.slice(0, 4).join(','))).size).toBe(8);
        for (const [x, y, w, h, px, py] of data.frames) {
            expect(x).toBeGreaterThanOrEqual(0); expect(y).toBeGreaterThanOrEqual(0);
            expect(w).toBeGreaterThan(0); expect(h).toBeGreaterThan(0);
            expect(x + w).toBeLessThanOrEqual(png.readUInt32BE(16));
            expect(y + h).toBeLessThanOrEqual(png.readUInt32BE(20));
            expect(px).toBeGreaterThan(0); expect(px).toBeLessThanOrEqual(w); expect(py).toBeLessThanOrEqual(h);
        }
    });
    it('covers every moving enemy and preserves four walk frames at one scale', () => {
        for (const kind of Object.keys(ENEMIES) as EnemyKind[]) {
            if (kind === 'terminal') continue;
            const { e } = fixture(kind);
            const poses = [0, 1, 2, 3].map(n => enemyPose(e, 10, n, true, false));
            expect(new Set(poses.map(p => p.frame)).size).toBe(4);
            expect(new Set(poses.map(p => p.scale)).size).toBe(1);
        }
    });
    it('locks telegraph facing, respects exact impact and recovery, and does not invent damage', () => {
        const { r, e } = fixture(); cueEnemyAttack(e, 10, 10.6, Math.PI);
        e.angle = 0; e.hurtAt = 10.55;
        const before = JSON.stringify(r);
        expect(enemyPose(e, 10.59, 1, true, false)).toMatchObject({ state: 'windup', flip: true });
        expect(enemyPose(e, 10.6, 1, true, false).state).toBe('impact');
        expect(enemyPose(e, 10.8, 1, true, false).state).toBe('recover');
        expect(enemyPose(e, 11.1, 1, false, false).state).toBe('idle');
        expect(JSON.stringify(r)).toBe(before);
    });
    for (const kind of ['hater','ping-sniper','ratio-ram','ohio-express','reply-guy','mod-supremo','doomscroll-prime','boss'] as EnemyKind[])
        it(`${kind} telegraph cue matches the actual scheduled attack`, () => {
            const { r, e } = fixture(kind); e.nextAttack = r.time;
            updateEnemies(r, 0);
            expect(e.attackPose).toBeDefined();
            const first = r.areas.filter(a => a.source === e.id).sort((a,b) => a.at - b.at)[0];
            expect(e.attackPose!.impact).toBe(first.at);
            expect(e.attackPose!.angle).toBe(first.angle);
        });
    it('support pulses and contact produce immediate cues', () => {
        for (const kind of ['hype-bot','comment-mod','npc'] as EnemyKind[]) {
            const { r, e } = fixture(kind); e.nextAttack = 10;
            if (kind === 'npc') { e.x = r.pos.x; e.y = r.pos.y; }
            updateEnemies(r, 0); expect(e.attackPose!.impact).toBe(r.time);
        }
    });
    it('hurt and stagger have authored poses; berserk uses a different row without changing hitbox', () => {
        const { r, e } = fixture('boss'); r.hitEnemy(e, 5);
        expect(enemyPose(e, 10, 0, false, false).state).toBe('hurt');
        e.staggerUntil = 13; expect(enemyPose(e, 11, 0, false, false).state).toBe('stagger');
        expect(enemyPose(e, 14, 0, false, true).frame).toBe('boss-berserk:0');
        expect(e.radius).toBe(48);
    });
    it('walk advances with distance, freezes in pause, and resets on restart', () => {
        const { r, e } = fixture('npc'), animator = new EnemyAnimator();
        animator.sample(r, .1); e.x += 10; r.time += .1;
        const moving = animator.sample(r, .1)[0]; expect(moving.state).toBe('move');
        r.mode = 'paused'; expect(animator.sample(r, 1)[0]).toEqual(moving);
        r.mode = 'playing'; expect(animator.sample(r, .1)[0].state).toBe('idle');
        const next = fixture('npc'); expect(animator.sample(next.r, .1)[0].state).toBe('idle');
    });
    it('death is non-targetable, bounded, fades and preserves berserk after boss victory', () => {
        const { r, e } = fixture('boss'); r.time = 1081; r.kill(e);
        expect(r.mode).toBe('won'); expect(r.enemies).toHaveLength(0);
        const animator = new EnemyAnimator(); const p = animator.sample(r, .01)[0];
        expect(p.state).toBe('death'); expect(p.frame).toBe('boss-berserk:6');
        for (let i = 0; i < 10; i++) animator.sample(r, .1);
        expect(animator.sample(r, .1)).toHaveLength(0); expect(r.time).toBe(1081);
        const next = fixture('npc'); expect(animator.sample(next.r, .1)).toHaveLength(1);
        for (let i = 0; i < 100; i++) next.r.kill(next.r.spawn('npc', { x: 500, y: 500 })!);
        expect(next.r.defeatedEnemies).toHaveLength(64);
    });
    it('wave retirement is not a death and does not leave a corpse or XP', () => {
        const { r } = fixture(), animator = new EnemyAnimator(); animator.sample(r, .1);
        r.enemies = []; expect(animator.sample(r, .1)).toEqual([]); expect(r.defeatedEnemies).toEqual([]);
    });
});
