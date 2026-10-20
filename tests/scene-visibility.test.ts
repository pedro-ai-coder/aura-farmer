import { describe, expect, it } from 'vitest';
import { areaInRenderView, inRenderView } from '../src/browser/scene-visibility';
import type { Area } from '../src/game/simulation/types';

const viewport = { x: 200, y: 300, width: 400, height: 250 };
const area = (shape: Area['shape'], x: number, y: number, radius = 40): Area => ({
    id: 1, x, y, radius, shape, width: 30, angle: 0, arc: Math.PI,
    at: 1, end: 2, nextTick: 1, damage: 20, hostile: true,
    source: 0, weapon: '', activation: 1, primary: true,
    hit: [], label: '', start: 1,
});

describe('B2.2 world-space rendering visibility', () => {
    it('keeps actors and effects whose art overlaps the viewport edge', () => {
        expect(inRenderView(viewport, 210, 320)).toBe(true);
        expect(inRenderView(viewport, 610, 350, 12)).toBe(true);
        expect(inRenderView(viewport, 610, 350, 0)).toBe(false);
        expect(inRenderView(viewport, 20, 20, 50)).toBe(false);
        expect(inRenderView(viewport, 200, 300)).toBe(true);
        expect(inRenderView(viewport, 600, 550)).toBe(true);
    });

    it('draws everything when camera bounds are unknown or not yet initialized', () => {
        expect(inRenderView({ x: 0, y: 0, width: 0, height: 0 }, 999, 999)).toBe(true);
        expect(inRenderView({ x: Number.NaN, y: 0, width: 100, height: 100 }, -100, -100)).toBe(true);
    });

    it('keeps large telegraphs even if their center is outside the viewport', () => {
        expect(areaInRenderView(viewport, area('circle', 650, 390, 80))).toBe(true);
        expect(areaInRenderView(viewport, area('cone', 650, 390, 80))).toBe(true);
        expect(areaInRenderView(viewport, area('line', 760, 390, 180))).toBe(true);
        expect(areaInRenderView(viewport, area('ring', 800, 400, 40))).toBe(true);
        expect(areaInRenderView(viewport, area('circle', 1000, 1000, 10))).toBe(false);
        expect(areaInRenderView(viewport, area('ring', 1000, 1000, 40))).toBe(false);
    });

    it('never changes the model coordinates, timing, damage or array contents', () => {
        const effect = area('cone', 800, 600);
        const snapshot = JSON.stringify(effect);
        expect(areaInRenderView(viewport, effect)).toBe(false);
        expect(JSON.stringify(effect)).toBe(snapshot);
    });
});
