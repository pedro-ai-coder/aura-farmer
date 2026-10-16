import { ENEMIES } from '../catalog/enemies';
import { angleDelta, clearLine, direction, distance, move, spawnPoint } from './world';
import type { Run } from './run';
import type { Enemy } from './types';
/** Presentation cue only: deadlines are taken from the actual attack, never drive damage. */
export function cueEnemyAttack(e: Enemy, now: number, impact: number, angle: number, duration = .18) {
    if (e.attackPose && e.attackPose.impact > now && e.attackPose.impact < impact) return;
    e.attackPose = { start: now, impact, end: impact + duration + .22, angle };
}
export function updateEnemies(r: Run, dt: number) {
    for (const e of [...r.enemies]) {
        if (r.mode !== 'playing') break;
        if (e.born > r.time || e.hp <= 0)
            continue;
        const d = ENEMIES[e.kind];
        if (e.kind === 'terminal')
            continue;
        if (e.kind === 'boss' && r.berserk && r.time >= e.regenAt) {
            e.regenAt += 1;
            if (e.staggerUntil <= r.time)
                e.hp = Math.min(e.maxHp, e.hp + e.maxHp * .001);
        }
        if (e.staggerUntil > r.time)
            continue;
        const aim = direction(e, r.pos), delta = angleDelta(aim, e.angle);
        e.angle += Math.max(-Math.PI / 2 * dt, Math.min(Math.PI / 2 * dt, delta));
        const slow = e.slowUntil > r.time ? 1 - e.slow * (d.boss ? .5 : 1) : 1;
        const range = r.timers['taunt:' + e.id] > r.time ? 0 : e.kind === 'hater' ? 260 : e.kind === 'ping-sniper' ? 400 : 0;
        let speed = d.speed * slow;
        let moveAngle = aim;
        if (range && distance(e, r.pos) < range - 20)
            moveAngle += Math.PI;
        if (range && Math.abs(distance(e, r.pos) - range) < 20)
            speed = 0;
        if (e.chargeUntil > r.time) {
            speed = 320;
            moveAngle = e.chargeAngle;
        }
        if (e.kind === 'boss' && r.areas.some(a => a.source === e.id && a.at > r.time))
            speed = 0;
        const pos = move(e, Math.cos(moveAngle) * speed * dt, Math.sin(moveAngle) * speed * dt, e.radius);
        if (distance(pos, e) < speed * dt * .2 && speed > 0) {
            Object.assign(e, move(e, Math.cos(moveAngle + Math.PI / 2) * speed * dt, Math.sin(moveAngle + Math.PI / 2) * speed * dt, e.radius));
        }
        else
            Object.assign(e, pos);
        if (distance(e, r.pos) < e.radius + 16 && r.time >= e.contactAt) {
            e.contactAt = r.time + (d.boss ? 1 : .75);
            const mainActive = r.areas.some(a => a.source === e.id && a.hostile && Math.abs(a.at - r.time) < .05);
            if (!mainActive) {
                if (!e.attackPose || e.attackPose.end <= r.time) cueEnemyAttack(e, r.time, r.time, aim);
                r.hurt(e.damage * (e.kind === 'boss' ? r.bossDamageMultiplier : 1), e, true);
            }
        }
        if (r.mode !== 'playing') break;
        const damage = e.damage * (e.kind === 'boss' ? r.bossDamageMultiplier : 1);
        const area = (delay: number, radius: number, value: number, shape: 'circle' | 'cone' | 'line' | 'ring' = 'circle', duration = .15, point = { x: e.x, y: e.y }, angle = aim, label = d.name) => {
            cueEnemyAttack(e, r.time, r.time + delay, angle);
            return r.addArea({ ...point, radius, damage: value, shape, width: 60, angle, arc: Math.PI * 2 / 3, at: r.time + delay, end: r.time + delay + duration, nextTick: r.time + delay, hostile: true, source: e.id, label });
        };
        const projectile = (delay: number, value = damage) => {
            // A visible locked aim telegraph resolves into a projectile at the exact deadline.
            const key = 'shot' + e.id;
            if (r.timers[key] === undefined) {
                r.timers[key] = r.time + delay;
                r.timers[key + 'angle'] = aim;
                area(delay, 600, 0, 'line', .01, { x: e.x, y: e.y }, aim, '!');
                e.nextAttack = r.time + delay;
                return false;
            }
            if (r.time >= r.timers[key]) {
                cueEnemyAttack(e, r.time, r.time, r.timers[key + 'angle']);
                r.shots.push({ x: e.x, y: e.y, id: r.nextId++, angle: r.timers[key + 'angle'], speed: e.kind === 'ping-sniper' ? 450 : 180, remaining: 800, damage: value, radius: 7, hostile: true, source: e.id, weapon: '', activation: 0, pierce: 1, hit: [], primary: false });
                delete r.timers[key];
                return true;
            }
            return false;
        };
        if (r.time >= e.nextAux) {
            if (e.kind === 'reply-guy') {
                for (let i = 0; i < 4; i++)
                    r.spawn('npc');
                e.nextAux = r.time + 12;
            }
            if (e.kind === 'mod-supremo') {
                area(1, 500, 15, 'line', .2, undefined, aim + .5, 'SILENCE LINE');
                area(1, 500, 15, 'line', .2, undefined, aim - .5, 'SILENCE LINE');
                e.nextAux = r.time + 10;
            }
            if (e.kind === 'doomscroll-prime' && r.time >= (r.timers.terminalsInterrupt ?? 0)) {
                for (let i = 0; i < 2; i++) {
                    const p = i ? spawnPoint(r.pos, r.random) : r.pos;
                    if (p)
                        area(1, 100, 12, 'circle', 3, { ...p });
                }
                e.nextAux = r.time + 7;
            }
        }
        if (e.kind === 'mod-supremo' && e.hp < e.maxHp * .5 && !r.counters['half' + e.id]) {
            r.counters['half' + e.id] = 1;
            r.spawn('hater');
            r.spawn('hater');
        }
        if (r.time < e.nextAttack) continue;
        switch (e.kind) {
            case 'hater':
                if (clearLine(e, r.pos)) {
                    if (projectile(.6))
                        e.nextAttack = r.time + 2.4;
                }
                else
                    e.nextAttack = r.time + .1;
                break;
            case 'ping-sniper':
                if (projectile(1.2))
                    e.nextAttack = r.time + 4.8;
                break;
            case 'ratio-ram':
            case 'ohio-express': {
                const key = 'charge' + e.id;
                if (!r.timers[key]) {
                    r.timers[key] = r.time + .8;
                    e.chargeAngle = aim;
                    area(.8, 280, 0, 'line', .01, { x: e.x, y: e.y }, aim, 'CHARGE');
                    e.nextAttack = r.time + .8;
                }
                else {
                    delete r.timers[key];
                    e.chargeUntil = r.time + 280 / 320;
                    cueEnemyAttack(e, r.time, r.time, e.chargeAngle, 280 / 320);
                    e.nextAttack = r.time + (e.kind === 'ratio-ram' ? 5 : ((e.phase++ % 3) < 2 ? 1.7 : 5.6));
                }
                break;
            }
            case 'doomscroller':
                area(1, 70, damage, 'circle', 3, { ...r.pos });
                e.nextAttack = r.time + 6;
                break;
            case 'hype-bot': {
                cueEnemyAttack(e, r.time, r.time, aim);
                for (const ally of r.enemies.filter(a => a.id !== e.id && !ENEMIES[a.kind].boss && distance(e, a) < 160).slice(0, 3)) {
                    ally.shield = ally.maxHp * .15;
                    ally.shieldUntil = r.time + 4;
                }
                e.nextAttack = r.time + 8;
                break;
            }
            case 'comment-mod':
                cueEnemyAttack(e, r.time, r.time, aim);
                for (const ally of r.enemies.filter(a => !ENEMIES[a.kind].boss && a.kind !== 'comment-mod' && distance(e, a) < 180).slice(0, 3))
                    ally.hp = Math.min(ally.maxHp, ally.hp + ally.maxHp * .08);
                e.nextAttack = r.time + 8;
                break;
            case 'fanum-leech':
                if (distance(e, r.pos) <= 200) {
                    for (let i = 0; i < 3; i++)
                        area(.8 + i, 240, 5, 'line', .1, { x: e.x, y: e.y }, aim, 'LEECH — BREAK AWAY');
                }
                e.nextAttack = r.time + 5;
                break;
            case 'reply-guy':
                area(.8, 260, 18, 'cone');
                e.nextAttack = r.time + 4;
                break;
            case 'mod-supremo':
                area(1, 130, 28);
                e.nextAttack = r.time + 6;
                break;
            case 'doomscroll-prime': {
                area(.6, 400, 18, 'cone');
                e.nextAttack = r.time + 4;
                if (!r.counters['terminals' + e.id]) {
                    r.counters['terminals' + e.id] = 1;
                    for (const point of [{ x: 430, y: 520 }, { x: 1050, y: 730 }])
                        r.spawn('terminal', point);
                }
                break;
            }
            case 'boss': {
                const slot = e.phase++ % 4;
                e.nextAttack = r.time + (r.berserk ? 4.8 : 6);
                if (slot === 0)
                    area(1, 200, 35 * r.bossDamageMultiplier, 'cone', .12, undefined, aim, 'HATE SLAM');
                if (slot === 1) {
                    area(1.2, 600, 30 * r.bossDamageMultiplier, 'line', .1, undefined, aim, 'RATIO BEAM');
                    if (r.counters.bossBeamPhase)
                        area(1.3, 600, 8 * r.bossDamageMultiplier, 'line', 2, undefined, aim, 'RESIDUAL');
                }
                if (slot === 2) {
                    area(1, 280, 25 * r.bossDamageMultiplier, 'ring', 1.5, undefined, aim, 'COMMENT RING — GAP');
                    if (r.counters.bossRingPhase)
                        area(1.8, 280, 25 * r.bossDamageMultiplier, 'ring', 1.5, undefined, aim, 'SECOND RING');
                }
                if (slot === 3) {
                    cueEnemyAttack(e, r.time, r.time, aim);
                    for (const kind of ['npc', 'npc', 'npc', 'npc', 'hype-bot'] as const)
                        if (r.enemies.filter(a => r.counters['add:' + a.id]).length < 8)
                            r.spawn(kind, undefined, false, true);
                }
                break;
            }
            default: e.nextAttack = r.time + 1;
        }

    }
}
