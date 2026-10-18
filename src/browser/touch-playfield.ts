import type { Point } from '../game/simulation/world';

interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

/**
 * The Phaser canvas may contain empty background beside the world image,
 * particularly on mobile after fullscreen/orientation changes.
 * Intersect the projected world image with the actual canvas viewport.
 * All returned coordinates are relative to #app for a positioned overlay.
 */
export function visiblePlayfieldBounds(
    canvas: Rect,
    stage: Pick<Rect, 'left' | 'top'>,
    viewportWorld: { topLeft: Point; bottomRight: Point },
    world: Pick<Rect, 'width' | 'height'>,
): Rect {
    const worldSpanX = viewportWorld.bottomRight.x - viewportWorld.topLeft.x;
    const worldSpanY = viewportWorld.bottomRight.y - viewportWorld.topLeft.y;
    if (canvas.width <= 0 || canvas.height <= 0 || worldSpanX <= 0 || worldSpanY <= 0)
        return { left: 0, top: 0, width: 0, height: 0 };

    const pixelsPerWorldX = canvas.width / worldSpanX;
    const pixelsPerWorldY = canvas.height / worldSpanY;
    const projectedLeft = canvas.left - viewportWorld.topLeft.x * pixelsPerWorldX;
    const projectedTop = canvas.top - viewportWorld.topLeft.y * pixelsPerWorldY;
    const left = Math.max(canvas.left, projectedLeft);
    const top = Math.max(canvas.top, projectedTop);
    const right = Math.min(canvas.left + canvas.width, projectedLeft + world.width * pixelsPerWorldX);
    const bottom = Math.min(canvas.top + canvas.height, projectedTop + world.height * pixelsPerWorldY);
    return {
        left: left - stage.left,
        top: top - stage.top,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
    };
}
