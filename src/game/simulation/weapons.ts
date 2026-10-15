import { weaponById } from '../catalog/content';
import { itemInterval, itemPower } from './inventory';
import { direction } from './world';
import type { Run } from './run';
import type { Input } from './types';
export function updateWeapons(r: Run, input: Input) {
    for (const item of r.inventory.weapons) {
        const w = weaponById(item.id)!;
        if (r.time < (r.timers[w.id] ?? 0))
            continue;
        const range = w.range * (w.role === 'ranged' ? 1 + .08 * r.inventory.level('timeline') : r.areaScale);
        const target = r.target(range);
        if (!target) {
            r.timers[w.id] = r.time + .1;
            continue;
        }
        if (r.activeFlex && r.characterId === 'sigma' && !r.enemies.some(e => e.id === r.flexTarget))
            r.flexTarget = r.target(600)?.id ?? 0;
        const activation = ++r.activation;
        r.timers[w.id] = r.time + itemInterval(item, r.frequency);
        r.timers.attackUntil = r.time + .22;
        r.counters[w.id] = (r.counters[w.id] ?? 0) + 1;
        const count = r.counters[w.id], legendary = item.rarity === 'legendary';
        r.counters.directional = (r.counters.directional ?? 0) + 1;
        const streak = r.inventory.level('no-cap-streak') && r.counters.directional % 5 === 0;
        const empowered = r.counters.certified === 1;
        r.counters.certified = 0;
        let damage = w.damage * r.power * itemPower(item) * (streak ? 1.1 : 1) * (empowered ? 1.2 : 1);
        const angle = input.manual && input.aim ? r.facing : direction(r.pos, target);
        const origin = { ...r.pos }, scale = r.areaScale;
        const area = (delay: number, coefficient = 1, radius = range, shape: 'cone' | 'circle' | 'line' = 'cone', secondary = false, point = origin) => r.addArea({ ...point, radius, shape, angle, arc: (w.angle ?? 360) * Math.PI / 180, damage: damage * coefficient, at: r.time + delay, end: r.time + delay + .12, nextTick: r.time + delay, weapon: w.id, weaponPower: itemPower(item), activation, primary: !secondary, label: w.name });
        const shot = (extra = false, delay = 0) => r.shots.push({ ...origin, at: r.time + delay, id: r.nextId++, angle, speed: (w.id === 'no-cap' ? 750 : 650) * (range / w.range), remaining: range, damage: extra ? .1 * r.power * itemPower(item) : damage, radius: w.id === 'no-cap' ? 16 : 6, hostile: false, source: 0, weapon: w.id, activation, pierce: (w.id === 'no-cap' ? 4 : 1) + (streak ? r.inventory.level('no-cap-streak') : 0) + (r.activeFlex && r.characterId === 'sigma' ? 1 : 0), hit: [], primary: !extra });
        if (w.shape === 'shot' || w.shape === 'line') {
            shot();
            if (legendary && w.id === 'ratio-blaster' && count % 4 === 0) {
                shot(true, .08);
                shot(true, .16);
            }
            if (legendary && w.id === 'no-cap')
                area(.7, .5, range, 'line', true);
        }
        else if (w.shape === 'blast') {
            const point = { x: target.x, y: target.y };
            area(.45, 1, 100 * scale, 'circle', false, point);
            if (legendary)
                for (const offset of [-80, 0, 80]) {
                    const a = area(.75, .15 / .65, 65 * scale, 'circle', true, { x: point.x + Math.cos(angle + Math.PI / 2) * offset, y: point.y + Math.sin(angle + Math.PI / 2) * offset });
                    // Share hit memory across secondary impacts: one secondary hit per target.
                    const key = 'feed:' + activation;
                    const old = r.areas.find(x => x.label === key);
                    a.label = key;
                    if (old)
                        a.hit = old.hit;
                }
        }
        else {
            if (w.id === 'touch-grass' && legendary && count % 3 === 0) {
                damage *= 1.25;
                area(0, 1, 150 * scale, 'circle').label = 'GRASS LEGEND';
            }
            else {
                const a = area(w.delay ?? 0, 1, range, w.shape === 'pulse' ? 'circle' : 'cone');
                if (legendary && w.id === 'cope-shield' && count % 3 === 0)
                    a.label = 'SHIELD LEGEND';
            }
            if (w.second) {
                const second = area(w.second);
                if (w.id === 'chad-hands') second.label = 'CHAD SECOND';
            }
            if (legendary) {
                if (w.id === 'keyboard-warrior' && count % 3 === 0)
                    area(.24, .25 / .18, 120 * scale, 'cone', true);
                if (w.id === 'ban-hammer')
                    area(.8, .30 / .90, 220, 'line', true);
                if (w.id === 'personal-space' && count % 2 === 0)
                    r.addShield('my-aura', r.maxHp * .04 * itemPower(item), 3);
            }
        }
        r.effect('attack', r.pos, undefined, Math.min(55, range));
    }
}
