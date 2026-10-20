import type { Area } from '../game/simulation/types';

/** Rendering-only bounds. This never affects combat, targeting, RNG or spawn. */
export interface RenderBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** Phaser's initial worldView can be empty before the camera's first update.
 * An unknown view must render everything rather than drop important cues.
 */
export function inRenderView(view: RenderBounds, x: number, y: number, extent = 0): boolean {
    if (!Number.isFinite(view.x) || !Number.isFinite(view.y) ||
        !Number.isFinite(view.width) || !Number.isFinite(view.height) ||
        view.width <= 0 || view.height <= 0) return true;
    const margin = Math.max(0, extent);
    return x + margin >= view.x && x - margin <= view.x + view.width &&
        y + margin >= view.y && y - margin <= view.y + view.height;
}

/** Overestimate effect extents to avoid clipping danger markers near edges. */
export function areaInRenderView(view: RenderBounds, area: Area): boolean {
    const extent = area.shape === 'ring'
        ? Math.max(280, area.radius) + 32
        : area.shape === 'line'
            ? area.radius + Math.max(0, area.width) / 2 + 32
            : area.radius + 32;
    return inRenderView(view, area.x, area.y, extent);
}
