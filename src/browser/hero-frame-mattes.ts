import type Phaser from 'phaser';

/** Existing V1 atlases contain a handful of source rectangles which overlap a
 * neighbour by a few pixels. Those narrow bands may show stray boots,
 * keyboards or shield fragments in the wrong pose.
 *
 * This is a runtime extraction cleanup of *already approved* artwork.
 * Original PNG files, source frame rectangles, pivots and gameplay hitboxes
 * remain unchanged. Never use this table to fabricate missing animation poses.
 */
export const HERO_FRAME_EDGE_MATTE = {
    'cool-kid': {
        27: { left: 0, right: 12 },  // neighbour's boot after keyboard attack
        28: { left: 28, right: 0 },  // previous keyboard at left edge
        29: { left: 0, right: 4 },   // next frame's stray outline
        30: { left: 4, right: 0 },   // previous outline at left edge
    },
    alpha: {
        34: { left: 0, right: 8 },   // next pose's shoe after shield windup
        35: { left: 20, right: 5 }, // previous shield + next pose's stray ink
        36: { left: 5, right: 0 },  // preceding slash fragment
    },
} as const;

type EdgeHero = keyof typeof HERO_FRAME_EDGE_MATTE;

export function heroFrameTexture(hero: string, sheet: string, frame: number):
    { key: string; frame?: number } {
    if (sheet === 'atlas' && hero in HERO_FRAME_EDGE_MATTE &&
        frame in HERO_FRAME_EDGE_MATTE[hero as EdgeHero]) {
        return { key: `${hero}-matte-${frame}` };
    }
    return { key: `${hero}-${sheet}`, frame };
}

/** Create only seven small, cropped runtime canvas textures.
 * Keep original frame dimensions to avoid foot-pivot jumps.
 */
export function installHeroFrameMattes(textures: Phaser.Textures.TextureManager) {
    for (const [hero, specs] of Object.entries(HERO_FRAME_EDGE_MATTE)) {
        const sheet = textures.get(`${hero}-atlas`);
        const source = sheet.getSourceImage() as HTMLImageElement;
        for (const [index, edges] of Object.entries(specs)) {
            const frame = sheet.get(Number(index));
            const canvas = document.createElement('canvas');
            canvas.width = frame.cutWidth;
            canvas.height = frame.cutHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas 2D unavailable for hero atlas cleanup');
            ctx.drawImage(source, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight,
                0, 0, canvas.width, canvas.height);
            if (edges.left > 0) ctx.clearRect(0, 0, edges.left, canvas.height);
            if (edges.right > 0) ctx.clearRect(canvas.width - edges.right, 0, edges.right, canvas.height);
            textures.addCanvas(`${hero}-matte-${index}`, canvas);
        }
    }
}
