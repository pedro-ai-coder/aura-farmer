import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CHARACTERS } from '../src/game/data/characters';
import { CARTOON_ENEMY_IDS, CARTOON_HERO_IDS, CARTOON_HERO_POSES, CARTOON_ENEMY_POSES } from '../src/game/render/cartoonArt';

const folder = join(process.cwd(), 'public/assets/cartoon/v1');
const asset = (part: string): string => readFileSync(join(folder, part), 'utf8');

describe('cartoon v3 production pose pack', () => {
  it('has one new SVG for each existing selectable hero ID', () => {
    expect([...CARTOON_HERO_IDS].sort()).toEqual(CHARACTERS.map(hero => hero.id).sort());
    for (const id of CARTOON_HERO_IDS) {
      const svg = asset(`characters/${id}.svg`);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('viewBox="0 0 128 128"');
      for(const pose of CARTOON_HERO_POSES.filter(p=>p!=='idle')){
        const frame=asset(`characters/poses/${id}-${pose}.svg`);
        expect(frame).toContain('<svg');
        expect(frame).toContain('viewBox="0 0 128 128"');
        expect(frame).not.toContain('<script');
      }
    }
  });

  it('covers every existing enemy family and a single arena skin', () => {
    expect([...CARTOON_ENEMY_IDS].sort()).toEqual(['beta', 'boss', 'hater', 'npc']);
    for (const id of CARTOON_ENEMY_IDS) {
      const svg = asset(`enemies/${id}.svg`);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      for(const pose of CARTOON_ENEMY_POSES.filter(p=>p!=='idle')){
        expect(asset(`enemies/poses/${id}-${pose}.svg`)).toContain('viewBox="0 0 128 128"');
      }
    }
    const floor = asset('arenas/aura-court.svg');
    expect(floor).toContain('viewBox="0 0 960 600"');
    expect(floor).not.toContain('<script');
  });
});
