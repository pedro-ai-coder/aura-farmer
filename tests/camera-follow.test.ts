import { describe, expect, it } from 'vitest';
import { chooseCameraZoom, followCameraCenter } from '../src/browser/camera-follow';
import { ORIGINAL_ALLEY, WORLD } from '../src/game/simulation/world';

describe('B2.3 adaptive camera and framerate independent following', () => {
    it('preserves familiar full-map menu, but zooms into desktop gameplay', () => {
        const home = chooseCameraZoom(1280, 720, ORIGINAL_ALLEY, false, false, true);
        const run = chooseCameraZoom(1280, 720, WORLD, true, false, true);
        expect(home).toBeCloseTo(720 / ORIGINAL_ALLEY.height);
        expect(run).toBeGreaterThan(home * 1.4);
        expect(1280 / run).toBeLessThan(WORLD.width);
        expect(720 / run).toBeLessThan(WORLD.height);
    });

    it('supports touch landscape world travel without shrinking to the whole arena', () => {
        const oldZoom = Math.max(915 / ORIGINAL_ALLEY.width, 412 / ORIGINAL_ALLEY.height);
        const zoom = chooseCameraZoom(915, 412, WORLD, true, true, true);
        expect(zoom).toBeGreaterThan(oldZoom);
        expect(915 / zoom).toBeLessThan(WORLD.width);
        expect(412 / zoom).toBeLessThan(WORLD.height);
    });

    it('keeps touch portrait rotate hint experience and avoids empty map margins on ultrawide play', () => {
        expect(chooseCameraZoom(390, 844, WORLD, true, true, false))
            .toBeCloseTo(Math.min(390 / WORLD.width, 844 / WORLD.height));
        expect(chooseCameraZoom(915, 412, ORIGINAL_ALLEY, false, true, true))
            .toBeCloseTo(Math.max(915 / WORLD.width, 412 / WORLD.height));
        const ultra = chooseCameraZoom(2400, 700, WORLD, true, false, true);
        expect(ultra).toBeGreaterThanOrEqual(2400 / WORLD.width);
    });

    it('smooths by time not frame count, without changing the input points', () => {
        const source = { x: 300, y: 250 }, target = { x: 900, y: 610 };
        const before = JSON.stringify([source, target]);
        let at60 = { ...source }, at10 = { ...source };
        for (let i = 0; i < 60; i++) at60 = followCameraCenter(at60, target, 1 / 60);
        for (let i = 0; i < 10; i++) at10 = followCameraCenter(at10, target, .1);
        expect(at60.x).toBeCloseTo(at10.x, 6);
        expect(at60.y).toBeCloseTo(at10.y, 6);
        expect(at60.x).toBeGreaterThan(source.x);
        expect(at60.x).toBeLessThanOrEqual(target.x);
        expect(JSON.stringify([source, target])).toBe(before);
    });

    it('freezes on pause/zero delta and clamps large delta from tab wake-ups', () => {
        const a = { x: 10, y: 20 }, b = { x: 100, y: 200 };
        expect(followCameraCenter(a, b, 0)).toEqual(a);
        expect(followCameraCenter(a, b, -1)).toEqual(a);
        expect(followCameraCenter(a, b, Infinity)).toEqual(a);
        expect(followCameraCenter(a, b, 3)).toEqual(followCameraCenter(a, b, .1));
    });
});
