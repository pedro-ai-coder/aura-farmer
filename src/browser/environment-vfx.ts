import type Phaser from 'phaser';
import { COVER } from '../game/simulation/world';
import type { Point } from '../game/simulation/world';

/** Option A: light from upper left, with short grounded shadows. This helper
 * is presentation-only and consumes approved collision data without editing it.
 */
export const ALLEY_LIGHT = { x: -7, y: 6 } as const;
const INK = 0x253449;
const PAPER = 0xf7edcd;
export interface CoverContact {
    x: number;
    y: number;
    radius: number;
    shadowX: number;
    shadowY: number;
}

/** The true physical cover center/radius is the sole footprint source.
 * Never invent an obstructing prop where the game has no cover collision.
 */
export function coverContacts(): CoverContact[] {
    return COVER.map(cover => ({
        x: cover.x, y: cover.y, radius: cover.r,
        shadowX: cover.x - ALLEY_LIGHT.x,
        shadowY: cover.y + ALLEY_LIGHT.y,
    }));
}

/** Static cached graphics under both props and characters. Two tiny
 * ground-contact accents per actual solid cover; no sprite duplication.
 */
export function drawCoverContacts(g: Phaser.GameObjects.Graphics) {
    for (const contact of coverContacts()) {
        const { x, y, radius, shadowX, shadowY } = contact;
        g.fillStyle(INK, .16);
        g.fillEllipse(shadowX, shadowY + 4, radius * 2.35, radius * .92);
        g.fillStyle(INK, .28);
        g.fillEllipse(x, y + 1, radius * 1.85, radius * .52);
        g.lineStyle(2, PAPER, .42);
        g.beginPath();
        g.arc(x, y + 1, radius - 3, .12 * Math.PI, .88 * Math.PI);
        g.strokePath();
    }
}

/** Use a single common world-space contact language for the actual feet of
 * player and enemies. Radius is visual only; neither collisions nor cover
 * geometry is derived from the drawn ellipse.
 */
export function drawActorContact(g: Phaser.GameObjects.Graphics, at: Point, radius: number) {
    const width = Math.max(20, Math.min(105, radius * 2.1));
    const height = Math.max(8, Math.min(32, radius * .55));
    g.fillStyle(INK, .22);
    g.fillEllipse(at.x + 3, at.y + 4, width, height);
    g.fillStyle(INK, .07);
    g.fillEllipse(at.x + 7, at.y + 6, width * .75, height * .65);
}

/** Reproduce the same two elliptical contact accents in a tiny canvas texture,
 * once per enemy radius, instead of tessellating ~200 Graphics ellipses per
 * rendered frame in a dense wave. No new PNGs or gameplay entities.
 */
export function actorContactTexture(
    textures: Phaser.Textures.TextureManager, radius: number,
): { key: string; originX: number; originY: number } {
    const width = Math.max(20, Math.min(105, radius * 2.1));
    const height = Math.max(8, Math.min(32, radius * .55));
    const padding = 12;
    const anchorX = Math.ceil(width / 2 + padding);
    const anchorY = Math.ceil(height / 2 + padding);
    const canvasWidth = Math.ceil(width + padding * 2);
    const canvasHeight = Math.ceil(height + padding * 2);
    const key = 'actor-contact-' + Math.round(radius * 100);
    if (!textures.exists(key)) {
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D unavailable for actor contact texture');
        ctx.fillStyle = 'rgba(37,52,73,0.22)';
        ctx.beginPath();
        ctx.ellipse(anchorX + 3, anchorY + 4, width / 2, height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(37,52,73,0.07)';
        ctx.beginPath();
        ctx.ellipse(anchorX + 7, anchorY + 6, width * .375, height * .325, 0, 0, Math.PI * 2);
        ctx.fill();
        textures.addCanvas(key, canvas);
    }
    return { key, originX: anchorX / canvasWidth, originY: anchorY / canvasHeight };
}
