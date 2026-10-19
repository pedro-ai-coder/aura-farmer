import { describe, expect, it } from 'vitest';
import { WEAPONS } from '../src/game/catalog/content';
import { Run } from '../src/game/simulation/run';
import {
    WEAPON_MOTIFS, OPTION_A_COLORS, weaponMotif,
    drawWeaponAreaAccent, drawWeaponProjectile, drawSpecialDrop, drawHeroProtection,
} from '../src/browser/combat-vfx';
import type { Area, Projectile } from '../src/game/simulation/types';

type DrawCall = { method: string; arguments: unknown[] };
function recorder() {
    const calls: DrawCall[] = [];
    const graphics = new Proxy({}, {
        get: (_, property) => (...args: unknown[]) => {
            calls.push({ method: String(property), arguments: args });
            return graphics;
        },
    }) as Parameters<typeof drawWeaponProjectile>[0];
    return { graphics, calls };
}
function shot(weapon: string): Projectile {
    return {
        x: 300, y: 250, id: 1, angle: Math.PI / 5, speed: 700,
        remaining: 400, damage: 30, radius: weapon === 'no-cap' ? 16 : 6,
        hostile: false, source: 0, weapon, activation: 1,
        pierce: 1, hit: [], primary: true,
    };
}
function area(weapon: string): Area {
    return {
        x: 300, y: 250, id: 2, shape: weapon === 'personal-space' ? 'circle' : 'cone',
        radius: 120, width: 30, angle: .8, arc: Math.PI / 2,
        at: 10, end: 10.12, nextTick: 10, damage: 20,
        hostile: false, source: 0, weapon, activation: 1,
        primary: true, hit: [], label: weapon, start: 10,
    };
}

describe('V3 Option A combat presentation — simulation remains authoritative', () => {
    it('gives all nine shipped weapons different, stable motifs', () => {
        expect(WEAPONS).toHaveLength(9);
        expect(Object.keys(WEAPON_MOTIFS).sort()).toEqual(WEAPONS.map(w => w.id).sort());
        expect(new Set(Object.values(WEAPON_MOTIFS)).size).toBe(9);
        expect(weaponMotif('unknown')).toBeUndefined();
        expect(OPTION_A_COLORS.ink).toBe(0x253449);
        expect(OPTION_A_COLORS.aura).toBe(0xf8c45f);
        expect(OPTION_A_COLORS.teal).toBe(0x6eaab0);
    });
    it('keeps the No Cap projectile visibly different from the Ratio Blaster dart', () => {
        const first = recorder(), second = recorder();
        const ratio = shot('ratio-blaster'), cap = shot('no-cap');
        const beforeRatio = JSON.stringify(ratio), beforeCap = JSON.stringify(cap);
        drawWeaponProjectile(first.graphics, ratio);
        drawWeaponProjectile(second.graphics, cap);
        expect(first.calls.length).toBeGreaterThan(2);
        expect(second.calls.length).toBeGreaterThan(2);
        expect(first.calls).not.toEqual(second.calls);
        expect(first.calls.some(x => x.method === 'fillTriangle')).toBe(true);
        expect(second.calls.some(x => x.method === 'fillEllipse')).toBe(true);
        expect(JSON.stringify(ratio)).toBe(beforeRatio);
        expect(JSON.stringify(cap)).toBe(beforeCap);
    });
    it('preserves the coral hostile shot and never draws friendly visual extras on hostile Areas', () => {
        const enemyShot = shot('no-cap');
        enemyShot.hostile = true;
        const { graphics, calls } = recorder();
        drawWeaponProjectile(graphics, enemyShot);
        expect(calls.some(c => c.method === 'lineStyle' &&
            c.arguments[1] === OPTION_A_COLORS.coral)).toBe(true);
        const hostile = area('ban-hammer');
        hostile.hostile = true;
        const snapshot = JSON.stringify(hostile);
        const before = calls.length;
        drawWeaponAreaAccent(graphics, hostile, false);
        expect(calls.length).toBe(before);
        expect(JSON.stringify(hostile)).toBe(snapshot);
    });
    it('all seven area weapons use distinct, non-simulated graphical cues', () => {
        const ids = WEAPONS.filter(w => w.shape !== 'shot' && w.shape !== 'line')
            .map(w => w.id);
        expect(ids).toHaveLength(7);
        const signatures = new Set<string>();
        for (const id of ids) {
            const shape = area(id);
            const snapshot = JSON.stringify(shape);
            const { graphics, calls } = recorder();
            drawWeaponAreaAccent(graphics, shape, false);
            expect(calls.length, id).toBeGreaterThan(0);
            expect(JSON.stringify(shape), id).toBe(snapshot);
            signatures.add(JSON.stringify(calls));
        }
        expect(signatures.size).toBe(7);
    });
    it('reduced-effects mode removes flourishes but keeps a readable weapon identity', () => {
        const a = area('keyboard-warrior');
        const full = recorder(), reduced = recorder();
        drawWeaponAreaAccent(full.graphics, a, false);
        drawWeaponAreaAccent(reduced.graphics, a, true);
        expect(reduced.calls.length).toBeGreaterThan(0);
        expect(full.calls.length).toBeGreaterThan(reduced.calls.length);
        const ring = recorder();
        drawWeaponAreaAccent(ring.graphics, area('personal-space'), true);
        expect(ring.calls.some(x => x.method === 'arc')).toBe(true);
    });
    it('keeps Aura Snack and Aura Magnet silhouettes distinct from ordinary XP', () => {
        const health = recorder(), magnet = recorder(), xp = recorder();
        const snack = { x: 80, y: 50, id: 1, xp: 0, kind: 'snack' as const };
        const pickup = { x: 80, y: 50, id: 2, xp: 0, kind: 'magnet' as const };
        expect(drawSpecialDrop(health.graphics, snack)).toBe(true);
        expect(drawSpecialDrop(magnet.graphics, pickup)).toBe(true);
        expect(drawSpecialDrop(xp.graphics, { x: 80, y: 50, id: 3, xp: 10 })).toBe(false);
        expect(xp.calls).toHaveLength(0);
        expect(health.calls).not.toEqual(magnet.calls);
        expect(health.calls.some(x => x.method === 'fillRoundedRect')).toBe(true);
        expect(magnet.calls.some(x => x.method === 'arc')).toBe(true);
    });
    it('shows shield absorption only for a real active shield and three separate Flex silhouettes', () => {
        const normal = new Run('alpha', 55);
        const noShield = recorder();
        drawHeroProtection(noShield.graphics, normal);
        expect(noShield.calls).toHaveLength(0);
        const combinations: string[] = [];
        for (const id of ['sigma', 'cool-kid', 'alpha'] as const) {
            const run = new Run(id, 55);
            run.time = 12;
            run.timers.flexStart = 11;
            run.flexUntil = 11 + run.hero.duration;
            if (id === 'alpha') run.addShield('alpha-hold', 20, 6);
            const before = JSON.stringify(run);
            const { graphics, calls } = recorder();
            drawHeroProtection(graphics, run);
            expect(calls.length, id).toBeGreaterThan(0);
            expect(JSON.stringify(run), id).toBe(before);
            combinations.push(JSON.stringify(calls));
        }
        expect(new Set(combinations).size).toBe(3);
        const shieldOnly = new Run('alpha', 55);
        shieldOnly.addShield('cope', 15, 5);
        const { graphics, calls } = recorder();
        drawHeroProtection(graphics, shieldOnly);
        expect(calls.length).toBeGreaterThan(2);
        expect(calls.some(x => x.method === 'strokeCircle')).toBe(true);
    });
    it('draws the actual Alpha Hold impact as a distinct Area, never a fake extra hit', () => {
        const a = area('');
        a.label = 'ALPHA HOLD';
        const raw = JSON.stringify(a), output = recorder();
        drawWeaponAreaAccent(output.graphics, a, false);
        expect(output.calls.length).toBeGreaterThan(0);
        expect(JSON.stringify(a)).toBe(raw);
        const seven = { ...a, label: 'SEVEN!' }, sevenOutput = recorder();
        drawWeaponAreaAccent(sevenOutput.graphics, seven, false);
        expect(sevenOutput.calls).not.toEqual(output.calls);
    });
});
