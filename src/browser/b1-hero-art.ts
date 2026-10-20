import type { HeroPose } from './hero-animation';

/** Each B1 source SVG has 16 original illustrated cells, 4 x 4 at 200 x 224. */
export const B1_SPRITE_CELL = { width: 200, height: 224, columns: 4, rows: 4 } as const;
export const B1_HERO_IDS = ['sigma', 'cool-kid', 'alpha'] as const;

export interface B1SpriteSelection {
    key: string;
    frame: number;
    scale: number;
    originY: number;
}

/** Maps already-selected simulation-driven poses onto B1 artwork.
 * Original animated Flex and four-stage defeat art stay in use until their
 * dedicated character-specific replacement sequences are accepted.
 * Changes no timers, hitboxes, equipment IDs, RNG, or combat logic.
 */
export function b1HeroArt(hero: string, pose: HeroPose, movementFacing: number, time: number):
    B1SpriteSelection | undefined {
    if (!B1_HERO_IDS.some(id => id === hero)) return undefined;
    if (pose.state.startsWith('flex') || pose.state === 'defeat') return undefined;
    let frame: number;
    if (pose.state === 'idle') {
        frame = Math.floor(Math.max(0, time) * 2) % 2;
    } else if (pose.state === 'run') {
        // Original animation picks the stride according to actual distance walked.
        const stride = ((pose.frame % 4) + 4) % 4;
        // Northward views use dedicated rear drawings, avoiding front-faced sprites.
        frame = Math.sin(movementFacing) < -0.3826834 ? 11 + stride : 2 + stride;
    } else if (pose.state === 'attack') {
        const base = hero === 'cool-kid' ? 26 : 34;
        frame = Math.max(6, Math.min(7, 6 + pose.frame - base));
    } else if (pose.state === 'hurt') {
        frame = 8;
    } else {
        return undefined;
    }
    return { key: `b1-${hero}`, frame, scale: 64 / 188, originY: 208 / 224 };
}
