import type Phaser from 'phaser';
import frames from './enemy-frames.json';
/** Separate adjacent drawings at load time without changing the source art or its alpha. */
export function installEnemyTextures(textures: Phaser.Textures.TextureManager) {
    for (const sheet of new Set(Object.values(frames).map(d => d.sheet))) {
        const rows = Object.entries(frames).filter(([, d]) => d.sheet === sheet);
        const data = rows[0][1];
        const source = textures.get(data.source).getSourceImage() as HTMLImageElement;
        const canvas = document.createElement('canvas'); canvas.width = data.width; canvas.height = data.textureHeight;
        const ctx = canvas.getContext('2d')!;
        for (const [, row] of rows) row.frames.forEach(([x, y, w, h], i) => {
            const [sx, sy] = row.sourceFrames[i];
            ctx.save(); ctx.beginPath();
            for (const [mx, my, mw, mh] of row.masks[i]) ctx.rect(x + mx, y + my, mw, mh);
            ctx.clip(); ctx.drawImage(source, sx, sy, w, h, x, y, w, h); ctx.restore();
        });
        const texture = textures.addCanvas(sheet, canvas)!;
        for (const [kind, row] of rows) row.frames.forEach(([x, y, w, h], i) => texture.add(`${kind}:${i}`, 0, x, y, w, h));
        // The compiled atlas owns its pixels; do not keep duplicate decoded GPU sources.
        textures.remove(data.source);
    }
}
