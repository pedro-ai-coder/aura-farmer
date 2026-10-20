import type Phaser from 'phaser';
import { ALLEY_ORIGIN, FLOOR, ORIGINAL_ALLEY, WORLD, WORLD_ORIGIN } from '../game/simulation/world';

/**
 * Uses only the approved Ruin Alley PNG. No AI-generated replacements, no
 * repeating walls: a crop of the clean central paving is mirrored to make
 * a seamless floor tile. The original illustration is blended on top at
 * its ORIGINAL scale to retain the authentic central district.
 */
export const FLOOR_PATCH = { x: 474, y: 370, size: 384 } as const;
export const FLOOR_TILE_SIZE = FLOOR_PATCH.size * 2;

function canvas2d(width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Ruin Alley canvas renderer not available');
    return { canvas, context };
}

export function installExpandedAlleyTextures(textures: Phaser.Textures.TextureManager) {
    if (textures.exists('ruin-floor-loop') && textures.exists('ruin-district-blend')) return;
    const image = textures.get('ruin').getSourceImage() as CanvasImageSource;
    const { x, y, size } = FLOOR_PATCH;

    if (!textures.exists('ruin-floor-loop')) {
        const { canvas, context: ctx } = canvas2d(FLOOR_TILE_SIZE, FLOOR_TILE_SIZE);
        // Mirroring the crop on both axes makes left/right and top/bottom
        // tile edges meet exactly. One small texture repeats across the world.
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                ctx.save();
                ctx.translate((col + 1) * size, (row + 1) * size);
                ctx.scale(col === 0 ? 1 : -1, row === 0 ? 1 : -1);
                // For normal tiles place at the previous quadrant; flipped
                // tiles start at the next quadrant's outer edge.
                ctx.drawImage(image, x, y, size, size,
                    col === 0 ? -size : 0,
                    row === 0 ? -size : 0, size, size);
                ctx.restore();
            }
        }
        textures.addCanvas('ruin-floor-loop', canvas);
    }

    if (!textures.exists('ruin-district-blend')) {
        const { canvas, context: ctx } = canvas2d(ORIGINAL_ALLEY.width, ORIGINAL_ALLEY.height);
        ctx.drawImage(image, 0, 0, ORIGINAL_ALLEY.width, ORIGINAL_ALLEY.height);
        // Feather only the artwork boundaries; keep the center exact. The
        // walls/props painted near the old edges do not tile into new districts.
        ctx.globalCompositeOperation = 'destination-in';
        const feather = 260;
        const xFade = ctx.createLinearGradient(0, 0, ORIGINAL_ALLEY.width, 0);
        xFade.addColorStop(0, 'rgba(255,255,255,0)');
        xFade.addColorStop(feather / ORIGINAL_ALLEY.width, '#fff');
        xFade.addColorStop(1 - feather / ORIGINAL_ALLEY.width, '#fff');
        xFade.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = xFade;
        ctx.fillRect(0, 0, ORIGINAL_ALLEY.width, ORIGINAL_ALLEY.height);
        const yFade = ctx.createLinearGradient(0, 0, 0, ORIGINAL_ALLEY.height);
        yFade.addColorStop(0, 'rgba(255,255,255,0)');
        yFade.addColorStop(feather / ORIGINAL_ALLEY.height, '#fff');
        yFade.addColorStop(1 - feather / ORIGINAL_ALLEY.height, '#fff');
        yFade.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = yFade;
        ctx.fillRect(0, 0, ORIGINAL_ALLEY.width, ORIGINAL_ALLEY.height);
        ctx.globalCompositeOperation = 'source-over';
        textures.addCanvas('ruin-district-blend', canvas);
    }
}

/** Static decoration is not collision geometry: only COVER blocks movement.
 * The visible perimeter is drawn directly from the FLOOR polygon.
 */
export function drawAlleyBoundary(
    graphics: Phaser.GameObjects.Graphics,
) {
    const boundary = FLOOR.map(p => ({ x: p.x, y: p.y }));
    graphics.lineStyle(40, 0x2e3441, .45);
    graphics.strokePoints(boundary, true);
    graphics.lineStyle(14, 0xc88950, .78);
    graphics.strokePoints(boundary, true);
    graphics.lineStyle(3, 0xf8cf8a, .42);
    graphics.strokePoints(boundary, true);
    // Small hazard stripe marks follow the actual boundary, never fictional
    // collision obstacles or glowing pick-ups.
    for (let i = 0; i < FLOOR.length; i++) {
        const a = FLOOR[i], b = FLOOR[(i + 1) % FLOOR.length];
        const distance = Math.hypot(b.x - a.x, b.y - a.y);
        const steps = Math.floor(distance / 220);
        const dx = (b.x - a.x) / distance, dy = (b.y - a.y) / distance;
        for (let j = 1; j <= steps; j++) {
            const p = j / (steps + 1), x = a.x + (b.x - a.x) * p;
            const y = a.y + (b.y - a.y) * p;
            graphics.lineStyle(5, 0x473d36, .55);
            graphics.lineBetween(x - dy * 12, y + dx * 12,
                x + dy * 12, y - dx * 12);
        }
    }
}

/** Deterministic ink scuffs create secondary navigational texture but have
 * no gameplay relevance, no collider and no per-frame render cost.
 */
export function drawAlleyScuffs(graphics: Phaser.GameObjects.Graphics) {
    let seed = 0x52251;
    const rand = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
    for (let i = 0; i < 145; i++) {
        const x = WORLD_ORIGIN.x + 260 + rand() * (WORLD.width - 520);
        const y = WORLD_ORIGIN.y + 260 + rand() * (WORLD.height - 520);
        const length = 10 + rand() * 28;
        const angle = rand() * Math.PI;
        graphics.lineStyle(1 + rand() * 1.8, 0x624e42, .15);
        graphics.lineBetween(x, y, x + Math.cos(angle) * length,
            y + Math.sin(angle) * length * .55);
        graphics.fillStyle(0xa8764e, .09);
        graphics.fillEllipse(x + 7, y + 5, 5 + rand() * 14, 3 + rand() * 9);
    }
}

/** One looping floor sprite, native-scale landmark painting and cached border. */
export function buildExpandedAlley(scene: Phaser.Scene) {
    installExpandedAlleyTextures(scene.textures);
    scene.add.tileSprite(WORLD_ORIGIN.x, WORLD_ORIGIN.y, WORLD.width, WORLD.height, 'ruin-floor-loop')
        .setOrigin(0).setDepth(-12).setName('ruin-expanded-floor');
    scene.add.image(ALLEY_ORIGIN.x, ALLEY_ORIGIN.y, 'ruin-district-blend')
        .setOrigin(0).setDepth(-11).setName('ruin-central-district');
    const marks = scene.add.graphics()
        .setName('ruin-landmark-scuffs').setDepth(-10);
    drawAlleyScuffs(marks);
    const boundary = scene.add.graphics()
        .setName('ruin-real-walkable-border').setDepth(-8);
    drawAlleyBoundary(boundary);
}
