import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import originalAtlasFrames from '../src/browser/hero-frames.json';
import originalRearFrames from '../src/browser/hero-rear-frames.json';
import originalCoolFlexFrames from '../src/browser/hero-flex-frames.json';
import { HERO_FRAME_EDGE_MATTE } from '../src/browser/hero-frame-mattes';

const gallery = JSON.parse(readFileSync(
    'public/assets/cartoon/option-a-v1/animation-gallery-data.json', 'utf8'));

describe('B1 approved sprite animation gallery source of truth', () => {
    it('only previews the three playable characters, with no new character art', () => {
        expect(Object.keys(gallery.heroes)).toEqual(['sigma', 'cool-kid', 'alpha']);
        expect(gallery.scope).toContain('no new characters');
        const html = readFileSync('public/assets/cartoon/option-a-v1/animation-gallery.html','utf8');
        for (const id of Object.keys(gallery.heroes)) expect(html).toContain('data-hero="' + id + '"');
        expect(html).toContain('sprites originais');
        expect(html).not.toContain('sigma-hero.svg');
        expect(html).not.toContain('/assets/cartoon/b1/');
    });

    for (const id of ['sigma', 'cool-kid', 'alpha'] as const) {
        it(id + ' references exactly the existing approved frame crop rectangles', () => {
            const entry = gallery.heroes[id];
            expect(entry.atlas.image).toBe('/assets/runtime/' + id + '-atlas.png');
            expect(entry.atlas.frames).toEqual(originalAtlasFrames[id]);
            expect(entry.matte).toEqual(HERO_FRAME_EDGE_MATTE[id as keyof typeof HERO_FRAME_EDGE_MATTE] ?? {});
            if (id === 'sigma') {
                expect(entry.rear).toBeUndefined();
                expect(entry.flex).toBeUndefined();
            } else {
                expect(entry.rear.frames).toEqual(originalRearFrames[id]);
                if (id === 'cool-kid') expect(entry.flex.frames).toEqual(originalCoolFlexFrames);
            }
        });
    }
});
