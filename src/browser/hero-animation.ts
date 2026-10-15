import type { Run } from '../game/simulation/run';

/** Pose selection only. Aim still controls attacks; locomotion follows movement. */
export function heroPose(r: Run): { frame: number; flip: boolean } {
    const cool = r.characterId === 'cool-kid';
    const left = Math.cos(r.facing) < 0;
    if (r.mode === 'lost') return { frame: cool ? 32 : 40, flip: left };
    if (r.timers.hurtUntil > r.time) return { frame: cool ? 29 : 37, flip: left };
    if (r.activeFlex) {
        const elapsed = r.hero.duration - (r.flexUntil - r.time);
        const count = r.characterId === 'alpha' ? 5 : 6;
        return { frame: (cool ? 33 : 41) + Math.min(count - 1, Math.floor(Math.max(0, elapsed) * 8)), flip: left };
    }
    if (r.timers.attackUntil > r.time) {
        return { frame: (cool ? 26 : 34) + Math.min(2, Math.max(0, Math.floor((.22 - (r.timers.attackUntil - r.time)) / .075))), flip: left };
    }
    if (r.moving) {
        const dir = (Math.round(r.movementFacing / (Math.PI / 4)) + 8) % 8;
        // Cool Kid has six authored walk groups; mirror the rear diagonal for NW.
        // Alpha has front/side poses only: use the closest authored side until new art exists.
        const groups = cool ? [0, 4, 8, 12, 16, 20, 20, 20]
            : r.characterId === 'alpha' ? [0, 8, 16, 24, 24, 24, 0, 0]
            : [0, 4, 8, 12, 16, 20, 24, 28];
        return { frame: groups[dir] + Math.floor(r.time * 9) % 4, flip: cool && dir === 5 };
    }
    return { frame: (cool ? 24 : 32) + Math.floor(r.time * 2) % 2, flip: left };
}
