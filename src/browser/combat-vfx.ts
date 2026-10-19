import type Phaser from 'phaser';
import type { Area, Drop, Projectile } from '../game/simulation/types';
import type { Run } from '../game/simulation/run';

/** Option A ink-and-paper motifs. These descriptors do not affect hit detection,
 * damage, RNG or timers. The nine weapon marks are intentionally non-identical.
 */
export const WEAPON_MOTIFS = {
    'ratio-blaster': 'dart',
    'no-cap': 'cap',
    'brainrot-feed': 'phone',
    'keyboard-warrior': 'keyboard',
    'ban-hammer': 'hammer',
    'touch-grass': 'leaf',
    'cope-shield': 'shield',
    'chad-hands': 'fists',
    'personal-space': 'segments',
} as const;
export type WeaponMotif = typeof WEAPON_MOTIFS[keyof typeof WEAPON_MOTIFS];

export const OPTION_A_COLORS = {
    ink: 0x253449,
    paper: 0xf7edcd,
    aura: 0xf8c45f,
    coral: 0xe57461,
    teal: 0x6eaab0,
    xp: 0x3ee6d2,
    magnet: 0x9476d0,
    snack: 0x6fcf9c,
} as const;

export function weaponMotif(id: string): WeaponMotif | undefined {
    return WEAPON_MOTIFS[id as keyof typeof WEAPON_MOTIFS];
}

/** Draw a readable world-space outline for actual simulated projectile positions.
 * Small (<=22 U) so it cannot masquerade as a damaging collision area.
 */
export function drawWeaponProjectile(g: Phaser.GameObjects.Graphics, shot: Projectile) {
    const { ink, paper, aura, coral } = OPTION_A_COLORS;
    const ux = Math.cos(shot.angle), uy = Math.sin(shot.angle);
    const x = shot.x, y = shot.y, vx = -uy, vy = ux;
    if (shot.hostile) {
        // Hostile danger retains its established coral language.
        g.lineStyle(6, coral, 1);
        g.lineBetween(x - ux * 16, y - uy * 16, x, y);
        g.fillStyle(0xff7280, 1);
        g.fillCircle(x, y, 5);
        return;
    }
    const motif = weaponMotif(shot.weapon);
    if (motif === 'cap') {
        // A cap crown and forward brim, not a generic golden bullet.
        g.fillStyle(ink, 1);
        g.fillEllipse(x - ux * 2, y - uy * 2, 28, 18);
        g.fillStyle(aura, 1);
        g.fillEllipse(x - ux * 2, y - uy * 2, 22, 13);
        g.lineStyle(5, ink, 1);
        g.lineBetween(x + ux * 7 - vx * 12, y + uy * 7 - vy * 12,
            x + ux * 14 + vx * 12, y + uy * 14 + vy * 12);
        g.lineStyle(3, paper, 1);
        g.lineBetween(x + ux * 7 - vx * 9, y + uy * 7 - vy * 9,
            x + ux * 13 + vx * 9, y + uy * 13 + vy * 9);
        return;
    }
    // Ratio Blaster: sharp triangular comment dart, with two ink wings.
    g.lineStyle(4, ink, 1);
    g.strokeTriangle(x + ux * 13, y + uy * 13,
        x - ux * 8 + vx * 6, y - uy * 8 + vy * 6,
        x - ux * 8 - vx * 6, y - uy * 8 - vy * 6);
    g.fillStyle(aura, 1);
    g.fillTriangle(x + ux * 11, y + uy * 11,
        x - ux * 6 + vx * 4, y - uy * 6 + vy * 4,
        x - ux * 6 - vx * 4, y - uy * 6 - vy * 4);
    g.lineStyle(2, paper, .95);
    g.lineBetween(x - ux * 14, y - uy * 14, x - ux * 22, y - uy * 22);
}

/** The simulation's actual Area is the authoritative hit region, and the
 * existing area renderer continues to draw that precise region first.
 * This motif is a compact *interior* shape, not a larger fake telegraph.
 */
export function drawWeaponAreaAccent(g: Phaser.GameObjects.Graphics, a: Area, reduced: boolean) {
    if (a.hostile) return;
    const motif = weaponMotif(a.weapon);
    const { ink, paper, aura, teal } = OPTION_A_COLORS;
    const x = a.x, y = a.y, ux = Math.cos(a.angle), uy = Math.sin(a.angle);
    const vx = -uy, vy = ux;
    const inside = Math.min(a.radius * .4, 42);
    const px = x + ux * inside, py = y + uy * inside;
    if (!motif && a.label !== 'ALPHA HOLD' && a.label !== 'SEVEN!') return;
    const color = motif === 'shield' || a.label === 'ALPHA HOLD' ? teal : aura;
    g.lineStyle(3, ink, .9);
    if (a.label === 'ALPHA HOLD') {
        // Three authentic Flex slams are separate Areas. No extra fake slams.
        g.lineStyle(4, teal, 1);
        for (const sign of [-1, 1]) {
            g.lineBetween(x + sign * 12, y + 12, x + sign * 24, y - 6);
            g.lineBetween(x + sign * 24, y - 6, x + sign * 16, y - 13);
        }
        return;
    }
    if (a.label === 'SEVEN!') {
        g.lineStyle(3, aura, .9);
        g.strokeCircle(x, y, Math.min(a.radius, 36));
        g.lineBetween(x - 10, y - 8, x + 9, y + 9);
        return;
    }
    switch (motif) {
        case 'phone': {
            // Brainrot Feed: illustrated phone inside the REAL delayed blast.
            const w = 23, h = 34;
            g.fillStyle(ink, .95);
            g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 4);
            g.fillStyle(paper, 1);
            g.fillRoundedRect(x - w / 2 + 3, y - h / 2 + 4, w - 6, h - 11, 2);
            g.lineStyle(2, aura, 1);
            g.lineBetween(x - 5, y - 3, x + 5, y - 3);
            g.lineBetween(x - 5, y + 2, x + 3, y + 2);
            break;
        }
        case 'keyboard': {
            // Two real hit Areas at distinct simulation deadlines remain distinct.
            const count = reduced ? 2 : 4;
            for (let i = 0; i < count; i++) {
                const off = (i - (count - 1) / 2) * 6;
                g.lineStyle(i % 2 ? 3 : 5, color, .95);
                g.lineBetween(px + vx * off - ux * 11, py + vy * off - uy * 11,
                    px + vx * off + ux * 11, py + vy * off + uy * 11);
            }
            break;
        }
        case 'hammer': {
            // Large rectangular hammer head perpendicular to strike direction.
            g.lineStyle(7, ink, 1);
            g.lineBetween(px - vx * 16, py - vy * 16, px + vx * 16, py + vy * 16);
            g.lineStyle(4, color, 1);
            g.lineBetween(px - vx * 15, py - vy * 15, px + vx * 15, py + vy * 15);
            g.lineStyle(4, ink, 1);
            g.lineBetween(px, py, px - ux * 23, py - uy * 23);
            break;
        }
        case 'leaf': {
            // Stylized two-leaf grass whip, in flat ink/teal.
            g.lineStyle(4, teal, 1);
            g.lineBetween(px - ux * 24, py - uy * 24, px + ux * 8, py + uy * 8);
            g.fillStyle(teal, .95);
            for (const sign of [-1, 1]) {
                g.fillTriangle(px + vx * sign * 12, py + vy * sign * 12,
                    px + ux * 6, py + uy * 6,
                    px - ux * 5, py - uy * 5);
            }
            break;
        }
        case 'shield': {
            // A shield crest centered INSIDE Cope Shield's bash cone.
            const topX = px + ux * 12, topY = py + uy * 12;
            g.lineStyle(4, ink, 1);
            g.strokeTriangle(topX, topY, px + vx * 15 - ux * 4, py + vy * 15 - uy * 4,
                px - vx * 15 - ux * 4, py - vy * 15 - uy * 4);
            g.lineStyle(2, teal, 1);
            g.lineBetween(px - vx * 9, py - vy * 9, topX, topY);
            g.lineBetween(px + vx * 9, py + vy * 9, topX, topY);
            break;
        }
        case 'fists': {
            for (const sign of [-1, 1]) {
                const fx = px + vx * sign * 12, fy = py + vy * sign * 12;
                g.fillStyle(ink, 1);
                g.fillRoundedRect(fx - 8, fy - 8, 16, 16, 5);
                g.fillStyle(aura, 1);
                g.fillRoundedRect(fx - 5, fy - 6, 10, 10, 3);
            }
            break;
        }
        case 'segments': {
            // Personal Space: discrete ring segments, not a permanent glow.
            const radius = Math.min(a.radius, 110);
            g.lineStyle(reduced ? 4 : 5, teal, .85);
            for (let i = 0; i < 8; i++) {
                const from = i * Math.PI / 4 + .1;
                g.beginPath();
                g.arc(x, y, radius, from, from + .38, false);
                g.strokePath();
            }
            break;
        }
        case 'cap': { // Legendary No Cap line is restricted to its real Area.
            g.lineStyle(4, aura, .95);
            g.lineBetween(x + ux * Math.min(a.radius, 50), y + uy * Math.min(a.radius, 50),
                x + ux * Math.min(a.radius, 80), y + uy * Math.min(a.radius, 80));
            break;
        }
        default:
            // Shot-family Ratio Blaster is represented by its projectile only.
            break;
    }
}

/** Dedicated silhouettes for drops. Ordinary XP is handled by the existing
 * diamond, while Snack and Magnet are non-interchangeable pictograms.
 */
export function drawSpecialDrop(g: Phaser.GameObjects.Graphics, d: Drop) {
    if (d.kind !== 'snack' && d.kind !== 'magnet') return false;
    const { ink, paper, magnet, snack } = OPTION_A_COLORS;
    g.fillStyle(ink, 1);
    g.fillCircle(d.x, d.y, 17);
    const x = d.x, y = d.y;
    if (d.kind === 'snack') {
        // Medical cross within a scalloped green health token.
        g.fillStyle(snack, 1);
        g.fillRoundedRect(x - 12, y - 12, 24, 24, 5);
        g.fillStyle(paper, 1);
        g.fillRect(x - 3, y - 9, 6, 18);
        g.fillRect(x - 9, y - 3, 18, 6);
    } else {
        // Purple U-shaped horseshoe with contrasting pole tips and ink outline.
        g.lineStyle(8, paper, 1);
        g.beginPath();
        g.arc(x, y - 1, 9, 0, Math.PI, false);
        g.strokePath();
        g.lineStyle(5, magnet, 1);
        g.beginPath();
        g.arc(x, y - 1, 9, 0, Math.PI, false);
        g.strokePath();
        g.fillStyle(magnet, 1);
        g.fillRect(x - 11, y - 3, 5, 8);
        g.fillRect(x + 6, y - 3, 5, 8);
        g.fillStyle(paper, 1);
        g.fillRect(x - 11, y - 3, 5, 3);
        g.fillRect(x + 6, y - 3, 5, 3);
    }
    return true;
}

/** Defensive UI and three distinctive Flex motifs, all tied to runtime state.
 * Avoid effects over hostile area/telegraph layers; ink anchors are <=60 U.
 */
export function drawHeroProtection(g: Phaser.GameObjects.Graphics, r: Run) {
    const { ink, aura, teal, paper } = OPTION_A_COLORS;
    const x = r.pos.x, y = r.pos.y;
    if (r.shield > 0) {
        g.lineStyle(5, ink, .85);
        g.strokeCircle(x, y - 15, 38);
        g.lineStyle(4, teal, .95);
        g.strokeCircle(x, y - 15, 36);
        g.lineStyle(3, paper, .95);
        g.lineBetween(x - 17, y - 45, x, y - 52);
        g.lineBetween(x, y - 52, x + 17, y - 45);
    }
    if (!r.activeFlex) return;
    // The hero's Flex duration and start are sourced solely from Run.
    const elapsed = Math.max(0, r.time - r.timers.flexStart);
    const progress = Math.max(0, Math.min(1, elapsed / r.hero.duration));
    if (r.characterId === 'sigma') {
        // Sigma Stare: reticle / locked precision eye, not Alpha's shield.
        g.lineStyle(4, aura, .95);
        g.strokeCircle(x, y - 10, 48);
        for (let n = 0; n < 4; n++) {
            const a = n * Math.PI / 2;
            g.lineBetween(x + Math.cos(a) * 41, y - 10 + Math.sin(a) * 41,
                x + Math.cos(a) * 55, y - 10 + Math.sin(a) * 55);
        }
    } else if (r.characterId === 'cool-kid') {
        // Giga Chad Rampage: sharp, directional sprint chevrons.
        const ux = Math.cos(r.movementFacing), uy = Math.sin(r.movementFacing);
        const vx = -uy, vy = ux;
        g.lineStyle(5, aura, .95);
        for (const side of [-1, 1]) {
            const bx = x - ux * 28 + vx * side * 27;
            const by = y - uy * 28 + vy * side * 27;
            g.lineBetween(bx - ux * 14, by - uy * 14, bx + ux * 12, by + uy * 12);
            g.lineBetween(bx + ux * 12, by + uy * 12, bx + vx * side * 7, by + vy * side * 7);
        }
    } else {
        // Alpha Hold: fixed teal barrier panels, unmistakably defensive.
        g.lineStyle(5, ink, .9);
        g.strokeCircle(x, y - 10, 52);
        g.lineStyle(4, teal, 1);
        for (const a of [-Math.PI * .8, -Math.PI * .5, -Math.PI * .2]) {
            g.beginPath();
            g.arc(x, y - 10, 52, a, a + .42);
            g.strokePath();
        }
        g.lineStyle(3, paper, .9);
        g.lineBetween(x - 17, y - 53, x, y - 62);
        g.lineBetween(x, y - 62, x + 17, y - 53);
    }
    // An exit cap is visual-only; no extra damage or activation pulse.
    if (!r.reduceMotion && progress > .92) {
        g.lineStyle(2, aura, .65 * (1 - progress) / .08);
        g.strokeCircle(x, y - 10, 58);
    }
}
