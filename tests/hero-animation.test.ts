import { describe, expect, it } from 'vitest';
import { heroPose } from '../src/browser/hero-animation';
import frames from '../src/browser/hero-frames.json';
import { Run } from '../src/game/simulation/run';

describe('authored hero pose playback', () => {
    it('keeps locomotion independent of automatic aim', () => {
        const r = new Run('sigma');
        r.moving = true; r.time = 1; r.movementFacing = -Math.PI / 2; r.facing = 0;
        expect(heroPose(r).frame).toBe(25);
    });
    it('uses the actual Cool Kid death pose, not a walk frame', () => {
        const r = new Run('cool-kid'); r.mode = 'lost'; r.moving = true;
        expect(heroPose(r).frame).toBe(32);
    });
    it('selects only bounded atlas frames through every direction and action', () => {
        for (const id of ['sigma', 'cool-kid', 'alpha'] as const) {
            const r = new Run(id);
            for (let dir = 0; dir < 8; dir++) for (let tick = 0; tick < 60; tick++) {
                r.time = tick / 10; r.moving = true; r.movementFacing = dir * Math.PI / 4;
                const pose = heroPose(r), box = frames[id][pose.frame];
                expect(box).toBeDefined();
                expect(box[0] + box[2]).toBeLessThanOrEqual(1448);
                expect(box[1] + box[3]).toBeLessThanOrEqual(1086);
            }
        }
    });
});
