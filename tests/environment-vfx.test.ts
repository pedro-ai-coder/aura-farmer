import { describe, expect, it } from 'vitest';
import { COVER, walkable, clearLine } from '../src/game/simulation/world';
import { ALLEY_LIGHT, coverContacts, drawCoverContacts, drawActorContact } from '../src/browser/environment-vfx';

function fakeGraphics() {
    const calls: { method: string; args: unknown[] }[] = [];
    const graphics = new Proxy({}, {
        get: (_, p) => (...args: unknown[]) => {
            calls.push({ method: String(p), args });
            return graphics;
        },
    }) as Parameters<typeof drawCoverContacts>[0];
    return { graphics, calls };
}

describe('V5 Ruin Alley contact shadows — visual-only', () => {
    it('grounds exactly the approved physical cover, not arbitrary decorations', () => {
        expect(coverContacts()).toHaveLength(COVER.length);
        const raw = JSON.stringify(COVER);
        for (const [i, at] of coverContacts().entries()) {
            expect(at).toMatchObject({ x: COVER[i].x, y: COVER[i].y, radius: COVER[i].r });
            expect(at.shadowX).toBeCloseTo(at.x - ALLEY_LIGHT.x);
            expect(at.shadowY).toBeCloseTo(at.y + ALLEY_LIGHT.y);
            expect(walkable({ x: at.x, y: at.y })).toBe(false);
        }
        expect(JSON.stringify(COVER)).toBe(raw);
    });
    it('draws a cached shadow for each real obstacle without touching collisions', () => {
        const before = JSON.stringify(COVER);
        const { graphics, calls } = fakeGraphics();
        drawCoverContacts(graphics);
        expect(calls.filter(c => c.method === 'fillEllipse')).toHaveLength(COVER.length * 2);
        expect(calls.filter(c => c.method === 'arc')).toHaveLength(COVER.length);
        expect(JSON.stringify(COVER)).toBe(before);
        expect(clearLine({ x: 550, y: 550 }, { x: 650, y: 550 })).toBe(false);
    });
    it('keeps shadows grounded and capped for dense-wave readability', () => {
        const { graphics, calls } = fakeGraphics();
        const point = { x: 724, y: 610 };
        drawActorContact(graphics, point, 20);
        drawActorContact(graphics, point, 90);
        const ellipses = calls.filter(x => x.method === 'fillEllipse');
        expect(ellipses).toHaveLength(4);
        for (const e of ellipses) {
            expect(e.args[0]).toBeGreaterThanOrEqual(point.x);
            expect(e.args[1]).toBeGreaterThanOrEqual(point.y);
            expect(e.args[2]).toBeLessThanOrEqual(105);
            expect(e.args[3]).toBeLessThanOrEqual(32);
        }
        expect(point).toEqual({ x: 724, y: 610 });
    });
});
