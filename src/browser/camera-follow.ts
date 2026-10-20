import type { Point } from '../game/simulation/world';

export interface WorldSize {
    width: number;
    height: number;
}

/** Keep menu/portrait behavior familiar; crop the world only during gameplay.
 * Landscape target is 1040×585U desktop and 1120×510U touch.
 * This uses approved Ruin Alley today; B2.4 will extend the actual world.
 */
export function chooseCameraZoom(
    width: number, height: number, world: WorldSize,
    playing: boolean, touch: boolean, landscape: boolean,
): number {
    if (width <= 0 || height <= 0 || world.width <= 0 || world.height <= 0)
        return 1;
    const fit = Math.min(width / world.width, height / world.height);
    const cover = Math.max(width / world.width, height / world.height);
    if (!playing) return touch && landscape ? cover : fit;
    // Preserve the rotate-phone hint and full-map layout in touch portrait.
    if (touch && !landscape) return fit;
    const desired = touch
        ? { width: 1120, height: 510 }
        : { width: 1040, height: 585 };
    const wanted = Math.min(width / desired.width, height / desired.height);
    // Avoid blue backdrop on extreme-aspect active landscape screens.
    return Math.max(cover, wanted);
}

/** Time-based smoothing: the same camera follow after 1 second at any FPS.
 * Visual-only, never modifies the simulation's real Run.pos.
 */
export function followCameraCenter(previous: Point, target: Point, delta: number): Point {
    if (!Number.isFinite(delta) || delta <= 0) return { ...previous };
    const alpha = 1 - Math.exp(-10 * Math.min(.1, delta));
    return {
        x: previous.x + (target.x - previous.x) * alpha,
        y: previous.y + (target.y - previous.y) * alpha,
    };
}
